import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import nodemailer from "nodemailer";
import { getMaintenanceClient } from "../lib/storage.js";

const REMIND_WINDOW_DAYS = 5;

interface TaskRow {
  project: string;
  task: string;
  category: string;
  dueDate: string;
  status: string;
  notes: string;
  daysUntil: number;
}

function daysUntil(dateStr: string): number {
  const due = new Date(dateStr + "T00:00:00Z");
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((due.getTime() - todayUtc) / 86400000);
}

function dueLabel(d: number): string {
  if (d < 0) return `${Math.abs(d)}d OVERDUE`;
  if (d === 0) return "due TODAY";
  return `due in ${d}d`;
}

function buildHtml(overdue: TaskRow[], soon: TaskRow[]): string {
  const section = (title: string, color: string, rows: TaskRow[]) =>
    rows.length === 0
      ? ""
      : `
    <h3 style="font-family:Georgia,serif;color:${color};border-bottom:2px solid ${color};padding-bottom:4px;margin:24px 0 8px">${title} (${rows.length})</h3>
    ${rows
      .map(
        (t) => `
      <div style="border:1px solid #d4cfc6;border-radius:8px;padding:12px 16px;margin:8px 0;background:#fff">
        <div style="font-family:Georgia,serif;font-size:15px;color:#1f2421">
          <b>${t.project}</b> — ${t.task}
        </div>
        <div style="font-family:Consolas,monospace;font-size:12px;color:${color};margin-top:4px">
          ${t.dueDate} · ${dueLabel(t.daysUntil)} · ${t.category}
        </div>
        ${t.notes ? `<div style="font-size:12px;color:#6b7066;margin-top:6px">${t.notes}</div>` : ""}
      </div>`,
      )
      .join("")}`;

  return `
  <div style="background:#faf7f2;padding:24px;max-width:680px;margin:0 auto">
    <h2 style="font-family:Georgia,serif;color:#1f2421;border-bottom:3px double #1f2421;padding-bottom:8px">
      Project Hub — Maintenance Reminders
    </h2>
    ${section("Overdue", "#a8221a", overdue)}
    ${section(`Due within ${REMIND_WINDOW_DAYS} days`, "#9a6b1a", soon)}
    <p style="font-size:12px;color:#6b7066;margin-top:24px">
      These remind daily until marked <b>Done</b> in the
      <a href="https://victorious-mud-0c0ea020f.1.azurestaticapps.net" style="color:#2c5282">Admin tab</a>.
    </p>
  </div>`;
}

async function remindHandler(
  req: HttpRequest,
  ctx: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const secret = process.env.SCAN_SECRET;
    if (!secret || req.query.get("secret") !== secret) {
      return { status: 401, jsonBody: { error: "Unauthorized" } };
    }

    const client = await getMaintenanceClient();
    const due: TaskRow[] = [];
    const entities = client.listEntities({
      queryOptions: { filter: "PartitionKey eq 'maintenance'" },
    });

    for await (const e of entities) {
      const status = String(e.status ?? "");
      const dueDate = String(e.dueDate ?? "");
      if (status === "done" || !dueDate) continue;
      const d = daysUntil(dueDate);
      if (d <= REMIND_WINDOW_DAYS) {
        due.push({
          project: String(e.project ?? ""),
          task: String(e.task ?? ""),
          category: String(e.category ?? ""),
          dueDate,
          status,
          notes: String(e.notes ?? ""),
          daysUntil: d,
        });
      }
    }

    if (due.length === 0) {
      ctx.log("No maintenance tasks due within window — no email sent");
      return { jsonBody: { sent: false, count: 0 } };
    }

    due.sort((a, b) => a.daysUntil - b.daysUntil);
    const overdue = due.filter((t) => t.daysUntil < 0);
    const soon = due.filter((t) => t.daysUntil >= 0);

    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    const to = process.env.REMIND_TO_EMAIL;
    if (!user || !pass || !to) {
      return { status: 500, jsonBody: { error: "GMAIL_USER / GMAIL_APP_PASSWORD / REMIND_TO_EMAIL not configured" } };
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    const subjectParts: string[] = [];
    if (overdue.length) subjectParts.push(`${overdue.length} overdue`);
    if (soon.length) subjectParts.push(`${soon.length} due soon`);

    await transporter.sendMail({
      from: `"Project Hub" <${user}>`,
      to,
      subject: `Maintenance: ${subjectParts.join(", ")}`,
      html: buildHtml(overdue, soon),
    });

    ctx.log(`Reminder email sent: ${overdue.length} overdue, ${soon.length} due soon`);
    return { jsonBody: { sent: true, count: due.length, overdue: overdue.length, dueSoon: soon.length } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { status: 500, jsonBody: { error: message } };
  }
}

app.http("maintenanceRemind", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "maintenance-remind",
  handler: remindHandler,
});

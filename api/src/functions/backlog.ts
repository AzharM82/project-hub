import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { getBacklogClient, addTombstone } from "../lib/storage.js";
import { isWriteAllowed, unauthorized } from "../lib/auth.js";

interface BacklogInput {
  title?: string;
  description?: string;
  category?: string;
  area?: string;
  priority?: string;
  status?: string;
}

const AREAS = ["Trading", "Learning", "Productivity", "Infrastructure", "Personal & Faith"];
const PRIORITIES = ["high", "medium", "low"];
const STATUSES = ["idea", "planned", "in-progress", "done", "dropped"];

function pick(v: string | undefined, allowed: string[], fallback: string): string {
  return v && allowed.includes(v) ? v : fallback;
}

async function backlogHandler(
  req: HttpRequest,
  _ctx: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    // Writes need the key; checked before touching storage so a missing key is a clean 401.
    if (req.method !== "GET" && !isWriteAllowed(req)) return unauthorized();

    const client = await getBacklogClient();

    // ─── GET ─────────────────────────────────────────
    if (req.method === "GET") {
      const items: Record<string, unknown>[] = [];
      const entities = client.listEntities({
        queryOptions: { filter: "PartitionKey eq 'backlog'" },
      });

      for await (const entity of entities) {
        items.push({
          id: entity.rowKey,
          title: entity.title,
          description: entity.description ?? "",
          category: entity.category ?? "",
          area: entity.area ?? "Trading",
          priority: entity.priority ?? "medium",
          status: entity.status ?? "idea",
          createdAt: entity.createdAt ?? "",
          updatedAt: entity.updatedAt ?? entity.createdAt ?? "",
        });
      }

      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      items.sort((a, b) => {
        const pa = priorityOrder[a.priority as string] ?? 3;
        const pb = priorityOrder[b.priority as string] ?? 3;
        if (pa !== pb) return pa - pb;
        return String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""));
      });

      return { jsonBody: items };
    }

    // ─── POST ────────────────────────────────────────
    if (req.method === "POST") {
      const body = (await req.json()) as BacklogInput;
      const title = body.title?.trim();
      if (!title) {
        return { status: 400, jsonBody: { error: "Title is required" } };
      }

      const rowKey = `${Date.now()}-${title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase().slice(0, 40)}`;
      const now = new Date().toISOString();
      const entity = {
        partitionKey: "backlog",
        rowKey,
        title,
        description: body.description ?? "",
        category: body.category?.trim() || "Idea",
        area: pick(body.area, AREAS, "Trading"),
        priority: pick(body.priority, PRIORITIES, "medium"),
        status: pick(body.status, STATUSES, "idea"),
        createdAt: now,
        updatedAt: now,
        seeded: false,
      };

      await client.createEntity(entity);
      return { status: 201, jsonBody: { id: rowKey, ...entity } };
    }

    // ─── PUT ─────────────────────────────────────────
    if (req.method === "PUT") {
      const id = req.query.get("id");
      if (!id) return { status: 400, jsonBody: { error: "id query param required" } };

      const body = (await req.json()) as BacklogInput;
      const existing = await client.getEntity("backlog", id);

      await client.updateEntity(
        {
          partitionKey: "backlog",
          rowKey: id,
          title: body.title?.trim() || (existing.title as string),
          description: body.description ?? (existing.description as string) ?? "",
          category: body.category ?? (existing.category as string) ?? "",
          area: pick(body.area, AREAS, (existing.area as string) ?? "Trading"),
          priority: pick(body.priority, PRIORITIES, (existing.priority as string) ?? "medium"),
          status: pick(body.status, STATUSES, (existing.status as string) ?? "idea"),
          createdAt: existing.createdAt,
          updatedAt: new Date().toISOString(),
          seeded: existing.seeded === true,
        },
        "Replace",
      );

      return { jsonBody: { ok: true } };
    }

    // ─── DELETE ──────────────────────────────────────
    if (req.method === "DELETE") {
      const id = req.query.get("id");
      if (!id) return { status: 400, jsonBody: { error: "id query param required" } };

      try {
        const existing = await client.getEntity("backlog", id);
        if (existing.seeded === true) await addTombstone("backlog", id);
      } catch { /* not found */ }
      await client.deleteEntity("backlog", id);
      return { jsonBody: { ok: true } };
    }

    return { status: 405, jsonBody: { error: "Method not allowed" } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { status: 500, jsonBody: { error: message } };
  }
}

app.http("backlog", {
  methods: ["GET", "POST", "PUT", "DELETE"],
  authLevel: "anonymous",
  route: "backlog",
  handler: backlogHandler,
});

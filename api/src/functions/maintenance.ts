import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { getMaintenanceClient } from "../lib/storage.js";
import { isWriteAllowed, unauthorized } from "../lib/auth.js";

interface MaintenanceInput {
  project?: string;
  task?: string;
  category?: string;
  dueDate?: string;
  status?: string;
  notes?: string;
}

async function maintenanceHandler(
  req: HttpRequest,
  _ctx: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    // Writes need the key; checked before touching storage so a missing key is a clean 401.
    if (req.method !== "GET" && !isWriteAllowed(req)) return unauthorized();

    const client = await getMaintenanceClient();

    // ─── GET ─────────────────────────────────────────
    if (req.method === "GET") {
      const items: Record<string, unknown>[] = [];
      const entities = client.listEntities({
        queryOptions: { filter: "PartitionKey eq 'maintenance'" },
      });

      for await (const entity of entities) {
        items.push({
          id: entity.rowKey,
          project: entity.project,
          task: entity.task,
          category: entity.category,
          dueDate: entity.dueDate,
          status: entity.status,
          notes: entity.notes,
          createdAt: entity.createdAt,
        });
      }

      // Sort by due date (earliest first), then by status
      const statusOrder: Record<string, number> = { overdue: 0, upcoming: 1, done: 2 };
      items.sort((a, b) => {
        const sa = statusOrder[a.status as string] ?? 3;
        const sb = statusOrder[b.status as string] ?? 3;
        if (sa !== sb) return sa - sb;
        return String(a.dueDate ?? "").localeCompare(String(b.dueDate ?? ""));
      });

      return { jsonBody: items };
    }

    // ─── POST ────────────────────────────────────────
    if (req.method === "POST") {
      const body = (await req.json()) as MaintenanceInput;
      if (!body.task || !body.project) {
        return { status: 400, jsonBody: { error: "Project and task are required" } };
      }

      const rowKey = `${Date.now()}-${body.task.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase().slice(0, 40)}`;

      const entity = {
        partitionKey: "maintenance",
        rowKey,
        project: body.project,
        task: body.task,
        category: body.category ?? "Secret/Key",
        dueDate: body.dueDate ?? "",
        status: body.status ?? "upcoming",
        notes: body.notes ?? "",
        createdAt: new Date().toISOString(),
      };

      await client.createEntity(entity);

      return {
        status: 201,
        jsonBody: { id: rowKey, ...entity },
      };
    }

    // ─── PUT ─────────────────────────────────────────
    if (req.method === "PUT") {
      const id = req.query.get("id");
      if (!id) return { status: 400, jsonBody: { error: "id query param required" } };

      const body = (await req.json()) as MaintenanceInput;
      const existing = await client.getEntity("maintenance", id);

      await client.updateEntity(
        {
          partitionKey: "maintenance",
          rowKey: id,
          project: body.project ?? existing.project,
          task: body.task ?? existing.task,
          category: body.category ?? existing.category,
          dueDate: body.dueDate ?? existing.dueDate,
          status: body.status ?? existing.status,
          notes: body.notes ?? existing.notes,
          createdAt: existing.createdAt,
        },
        "Replace",
      );

      return { jsonBody: { ok: true } };
    }

    // ─── DELETE ──────────────────────────────────────
    if (req.method === "DELETE") {
      const id = req.query.get("id");
      if (!id) return { status: 400, jsonBody: { error: "id query param required" } };

      await client.deleteEntity("maintenance", id);
      return { jsonBody: { ok: true } };
    }

    return { status: 405, jsonBody: { error: "Method not allowed" } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { status: 500, jsonBody: { error: message } };
  }
}

app.http("maintenance", {
  methods: ["GET", "POST", "PUT", "DELETE"],
  authLevel: "anonymous",
  route: "maintenance",
  handler: maintenanceHandler,
});

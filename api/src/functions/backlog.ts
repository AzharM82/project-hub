import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { getBacklogClient } from "../lib/storage.js";

interface BacklogInput {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  status?: string;
}

async function backlogHandler(
  req: HttpRequest,
  _ctx: InvocationContext,
): Promise<HttpResponseInit> {
  try {
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
          description: entity.description,
          category: entity.category,
          priority: entity.priority,
          status: entity.status,
          createdAt: entity.createdAt,
        });
      }

      // Sort by priority (high first), then by createdAt
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      items.sort((a, b) => {
        const pa = priorityOrder[a.priority as string] ?? 3;
        const pb = priorityOrder[b.priority as string] ?? 3;
        if (pa !== pb) return pa - pb;
        return String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? ""));
      });

      return { jsonBody: items };
    }

    // ─── POST ────────────────────────────────────────
    if (req.method === "POST") {
      const body = (await req.json()) as BacklogInput;
      if (!body.title) {
        return { status: 400, jsonBody: { error: "Title is required" } };
      }

      const rowKey = `${Date.now()}-${body.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase().slice(0, 40)}`;

      await client.createEntity({
        partitionKey: "backlog",
        rowKey,
        title: body.title,
        description: body.description ?? "",
        category: body.category ?? "Tool",
        priority: body.priority ?? "medium",
        status: body.status ?? "idea",
        createdAt: new Date().toISOString(),
      });

      return {
        status: 201,
        jsonBody: {
          id: rowKey,
          title: body.title,
          description: body.description ?? "",
          category: body.category ?? "Tool",
          priority: body.priority ?? "medium",
          status: body.status ?? "idea",
          createdAt: new Date().toISOString(),
        },
      };
    }

    // ─── PUT ─────────────────────────────────────────
    if (req.method === "PUT") {
      const id = req.query.get("id");
      if (!id) return { status: 400, jsonBody: { error: "id query param required" } };

      const body = (await req.json()) as BacklogInput;

      // Get existing entity
      const existing = await client.getEntity("backlog", id);

      await client.updateEntity(
        {
          partitionKey: "backlog",
          rowKey: id,
          title: body.title ?? existing.title,
          description: body.description ?? existing.description,
          category: body.category ?? existing.category,
          priority: body.priority ?? existing.priority,
          status: body.status ?? existing.status,
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

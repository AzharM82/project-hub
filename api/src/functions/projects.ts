import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { getProjectsClient, addTombstone } from "../lib/storage.js";
import { seedData, getStoredSeedVersion, SEED_VERSION } from "../lib/seed.js";
import { isWriteAllowed, unauthorized } from "../lib/auth.js";

interface ProjectInput {
  name?: string;
  url?: string;
  github?: string;
  purpose?: string;
  stack?: string;
  status?: string;
  cost?: string;
  category?: string;
  area?: string;
  details?: string;
}

const AREAS = ["Trading", "Learning", "Productivity", "Infrastructure", "Personal & Faith"];
const STATUSES = ["live", "paper", "local", "repo-only", "archived"];

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

async function projectsHandler(
  req: HttpRequest,
  ctx: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    // Writes need the key; checked before touching storage so a missing key is a clean 401.
    if (req.method !== "GET" && !isWriteAllowed(req)) return unauthorized();

    const client = await getProjectsClient();

    // ─── GET ─────────────────────────────────────────
    if (req.method === "GET") {
      const force = req.query.get("reseed") === "true";
      if (force || (await getStoredSeedVersion()) !== SEED_VERSION) {
        const result = await seedData();
        ctx.log(`Seeded ${result.projects} projects, ${result.backlog} new backlog items (version ${SEED_VERSION})`);
      }

      const projects: Record<string, unknown>[] = [];
      const entities = client.listEntities({
        queryOptions: { filter: "PartitionKey eq 'projects'" },
      });

      for await (const entity of entities) {
        projects.push({
          id: entity.rowKey,
          name: entity.name,
          url: entity.url ?? "",
          github: entity.github ?? "",
          purpose: entity.purpose ?? "",
          stack: entity.stack ?? "",
          status: entity.status ?? "local",
          cost: entity.cost ?? "",
          category: entity.category ?? "",
          area: entity.area ?? "Trading",
          details: entity.details ?? "",
          seeded: entity.seeded === true,
          updatedAt: entity.updatedAt ?? "",
        });
      }

      projects.sort((a, b) => String(a.name).localeCompare(String(b.name)));
      return { jsonBody: projects };
    }

    // ─── POST ────────────────────────────────────────
    if (req.method === "POST") {
      const body = (await req.json()) as ProjectInput;
      if (!body.name?.trim()) {
        return { status: 400, jsonBody: { error: "Name is required" } };
      }
      const area = AREAS.includes(body.area ?? "") ? body.area! : "Trading";
      const status = STATUSES.includes(body.status ?? "") ? body.status! : "local";
      const rowKey = `u-${Date.now()}-${body.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase().slice(0, 40)}`;
      const now = new Date().toISOString();

      const entity = {
        partitionKey: "projects",
        rowKey,
        name: body.name.trim(),
        url: str(body.url),
        github: str(body.github),
        purpose: str(body.purpose),
        stack: str(body.stack),
        status,
        cost: str(body.cost, "$0/mo"),
        category: str(body.category, "Other"),
        area,
        details: str(body.details),
        seeded: false,
        updatedAt: now,
      };
      await client.createEntity(entity);
      return { status: 201, jsonBody: { id: rowKey, ...entity } };
    }

    // ─── PUT ─────────────────────────────────────────
    if (req.method === "PUT") {
      const id = req.query.get("id");
      if (!id) return { status: 400, jsonBody: { error: "id query param required" } };

      const body = (await req.json()) as ProjectInput;
      const existing = await client.getEntity("projects", id);

      // Editing a seeded row detaches it from the seed so a future reseed
      // cannot overwrite the operator's change.
      await client.updateEntity(
        {
          partitionKey: "projects",
          rowKey: id,
          name: str(body.name, str(existing.name)),
          url: str(body.url, str(existing.url)),
          github: str(body.github, str(existing.github)),
          purpose: str(body.purpose, str(existing.purpose)),
          stack: str(body.stack, str(existing.stack)),
          status: STATUSES.includes(body.status ?? "") ? body.status! : str(existing.status, "local"),
          cost: str(body.cost, str(existing.cost)),
          category: str(body.category, str(existing.category)),
          area: AREAS.includes(body.area ?? "") ? body.area! : str(existing.area, "Trading"),
          details: str(body.details, str(existing.details)),
          seeded: false,
          updatedAt: new Date().toISOString(),
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
        const existing = await client.getEntity("projects", id);
        if (existing.seeded === true) await addTombstone("projects", id);
      } catch { /* not found */ }
      await client.deleteEntity("projects", id);
      return { jsonBody: { ok: true } };
    }

    return { status: 405, jsonBody: { error: "Method not allowed" } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { status: 500, jsonBody: { error: message } };
  }
}

app.http("projects", {
  methods: ["GET", "POST", "PUT", "DELETE"],
  authLevel: "anonymous",
  route: "projects",
  handler: projectsHandler,
});

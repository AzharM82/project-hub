import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { getProjectsClient } from "../lib/storage.js";
import { seedData, getStoredSeedVersion, SEED_VERSION } from "../lib/seed.js";

async function projectsHandler(
  req: HttpRequest,
  ctx: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    // Reseed when seed data has a new version (or when forced via ?reseed=true)
    const force = req.query.get("reseed") === "true";
    if (force || (await getStoredSeedVersion()) !== SEED_VERSION) {
      const result = await seedData();
      ctx.log(`Seeded ${result.projects} projects, ${result.backlog} backlog items (version ${SEED_VERSION})`);
    }

    const client = await getProjectsClient();
    const projects: Record<string, unknown>[] = [];

    const entities = client.listEntities({
      queryOptions: { filter: "PartitionKey eq 'projects'" },
    });

    for await (const entity of entities) {
      projects.push({
        id: entity.rowKey,
        name: entity.name,
        url: entity.url,
        github: entity.github,
        purpose: entity.purpose,
        stack: entity.stack,
        status: entity.status,
        cost: entity.cost,
        category: entity.category ?? "",
        details: entity.details ?? "",
      });
    }

    return { jsonBody: projects };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { status: 500, jsonBody: { error: message } };
  }
}

app.http("projects", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "projects",
  handler: projectsHandler,
});

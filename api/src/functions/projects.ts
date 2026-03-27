import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { getProjectsClient } from "../lib/storage.js";
import { seedData } from "../lib/seed.js";

async function projectsHandler(
  req: HttpRequest,
  ctx: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    // Seed on first request if needed
    if (req.query.get("seed") === "true") {
      const result = await seedData();
      ctx.log(`Seeded ${result.projects} projects, ${result.backlog} backlog items`);
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

import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { gateEnabled, isWriteAllowed } from "../lib/auth.js";

/**
 * GET  /api/auth-check → { gate: "open" | "locked" }           (is a key required at all?)
 * POST /api/auth-check → 200 { ok: true } | 401                 (does the supplied x-hub-key work?)
 */
async function authCheckHandler(req: HttpRequest): Promise<HttpResponseInit> {
  if (req.method === "GET") {
    return { jsonBody: { gate: gateEnabled() ? "locked" : "open" } };
  }
  if (!isWriteAllowed(req)) {
    return { status: 401, jsonBody: { ok: false, error: "invalid key" } };
  }
  return { jsonBody: { ok: true } };
}

app.http("authCheck", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "auth-check",
  handler: authCheckHandler,
});

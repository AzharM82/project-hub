import type { HttpRequest, HttpResponseInit } from "@azure/functions";

/**
 * Shared-key write gate.
 *
 * Reads are open. Every POST/PUT/DELETE must carry the key in the `x-hub-key`
 * header (the SPA stores it in localStorage after a one-time prompt).
 *
 * The key lives in the SWA app setting HUB_WRITE_KEY. If the setting is unset
 * the gate is OPEN — so a missing setting never locks the operator out, but the
 * response carries `x-hub-gate: open` so the UI can warn.
 */
export function isWriteAllowed(req: HttpRequest): boolean {
  const expected = process.env.HUB_WRITE_KEY;
  if (!expected) return true;
  const provided = req.headers.get("x-hub-key") ?? "";
  return timingSafeEqual(provided, expected);
}

export function gateEnabled(): boolean {
  return Boolean(process.env.HUB_WRITE_KEY);
}

export function unauthorized(): HttpResponseInit {
  return { status: 401, jsonBody: { error: "write key required", gate: "locked" } };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

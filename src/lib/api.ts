/**
 * Tiny API client.
 *  - attaches the write key (x-hub-key) from localStorage on every request
 *  - a 401 on a write raises `KeyRequiredError` so the UI can prompt once
 */
const KEY_STORAGE = "hub.writeKey";

export class KeyRequiredError extends Error {
  constructor() {
    super("write key required");
    this.name = "KeyRequiredError";
  }
}

export function getWriteKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

export function setWriteKey(key: string): void {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    // storage unavailable — key lives for this page load only
    memoryKey = key;
  }
}
let memoryKey = "";

type Listener = () => void;
const keyListeners = new Set<Listener>();
export function onKeyRequired(fn: Listener): () => void {
  keyListeners.add(fn);
  return () => keyListeners.delete(fn);
}

// Writes that hit a 401 park here until the KeyGate reports an unlock (true) or a cancel (false).
let unlockWaiters: ((ok: boolean) => void)[] = [];
export function notifyUnlock(ok: boolean): void {
  const w = unlockWaiters;
  unlockWaiters = [];
  w.forEach((fn) => fn(ok));
}
function waitForUnlock(): Promise<boolean> {
  return new Promise((resolve) => unlockWaiters.push(resolve));
}

export async function api<T = unknown>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const key = getWriteKey() || memoryKey;
  if (key) headers.set("x-hub-key", key);

  const res = await fetch(path, { ...init, headers });
  if (res.status === 401) {
    if (retried) throw new KeyRequiredError();
    // Ask for the key once, then replay this exact request.
    const pending = waitForUnlock();
    keyListeners.forEach((fn) => fn());
    const ok = await pending;
    if (!ok) throw new KeyRequiredError();
    return api<T>(path, init, true);
  }
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });

/** Verify a candidate key against the API. */
export async function verifyKey(key: string): Promise<boolean> {
  const res = await fetch("/api/auth-check", { method: "POST", headers: { "x-hub-key": key } });
  return res.ok;
}

/** Is the server enforcing a key at all? */
export async function gateStatus(): Promise<"open" | "locked" | "unknown"> {
  try {
    const res = await fetch("/api/auth-check");
    const j = (await res.json()) as { gate?: "open" | "locked" };
    return j.gate ?? "unknown";
  } catch {
    return "unknown";
  }
}

import { useEffect, useState } from "react";
import { getWriteKey, notifyUnlock, onKeyRequired, setWriteKey, verifyKey } from "../lib/api.js";

/**
 * One-time write-key prompt. Renders nothing until a write is rejected with 401
 * (or the user taps the lock icon in the header), then asks for the key,
 * verifies it, and stores it in localStorage for this device.
 */
export function KeyGate({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [visible, setVisible] = useState(open);
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => setVisible(open), [open]);
  useEffect(() => onKeyRequired(() => setVisible(true)), []);

  if (!visible) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const ok = await verifyKey(key.trim());
    setBusy(false);
    if (!ok) {
      setError("That key was not accepted.");
      return;
    }
    setWriteKey(key.trim());
    setKey("");
    setVisible(false);
    onClose();
    notifyUnlock(true);
  }

  function forget() {
    setWriteKey("");
    setVisible(false);
    onClose();
    notifyUnlock(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-[60] p-3">
      <form
        onSubmit={submit}
        className="bg-t-card border border-t-border rounded-lg w-full max-w-sm shadow-lg p-5 space-y-3"
      >
        <h3 className="text-lg font-bold text-t-text" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Write key
        </h3>
        <p className="text-xs text-t-muted">
          Reads are open. Adding or editing needs the hub key once per device — it is remembered in this browser.
        </p>
        <input
          type="password"
          autoFocus
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="hub key"
          className="w-full px-3 py-2 text-base border border-t-border rounded bg-t-bg text-t-text focus:outline-none focus:border-t-blue"
        />
        {error && <div className="text-xs text-t-red">{error}</div>}
        <div className="flex justify-between items-center gap-2 pt-1">
          <button type="button" onClick={forget} className="text-xs text-t-muted hover:text-t-red">
            {getWriteKey() ? "Forget key" : "Cancel"}
          </button>
          <button
            type="submit"
            disabled={busy || !key.trim()}
            className="px-4 py-2 text-sm font-semibold bg-t-text text-t-bg rounded disabled:opacity-50"
          >
            {busy ? "Checking…" : "Unlock"}
          </button>
        </div>
      </form>
    </div>
  );
}

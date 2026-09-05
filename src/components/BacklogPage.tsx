import { useState, useEffect, useCallback, useMemo } from "react";
import { AREAS, BACKLOG_STATUSES, type BacklogItem } from "../types.js";
import { api, json, KeyRequiredError } from "../lib/api.js";
import { AreaBadge, AreaChips } from "./AreaChips.js";
import { BacklogForm } from "./BacklogForm.js";

const PRIORITY_STYLE: Record<string, string> = {
  high: "text-t-red",
  medium: "text-t-amber",
  low: "text-t-muted",
};

const STATUS_LABEL: Record<string, string> = {
  idea: "Idea",
  planned: "Planned",
  "in-progress": "In progress",
  done: "Done",
  dropped: "Dropped",
};

const STATUS_STYLE: Record<string, string> = {
  idea: "bg-gray-100 text-gray-700",
  planned: "bg-blue-100 text-blue-800",
  "in-progress": "bg-amber-100 text-amber-800",
  done: "bg-green-100 text-green-800",
  dropped: "bg-red-50 text-red-700 line-through",
};

type StatusFilter = "open" | "all" | (typeof BACKLOG_STATUSES)[number];

export function BacklogPage() {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<BacklogItem | null>(null);
  const [area, setArea] = useState<string>(() => {
    try {
      return localStorage.getItem("hub.backlog.area") ?? "";
    } catch {
      return "";
    }
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [quick, setQuick] = useState("");
  const [quickArea, setQuickArea] = useState<string>("Trading");
  const [quickBusy, setQuickBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/backlog");
      setItems((await res.json()) as BacklogItem[]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  function selectArea(a: string) {
    setArea(a);
    if (a) setQuickArea(a);
    try {
      localStorage.setItem("hub.backlog.area", a);
    } catch {
      // ignore
    }
  }

  async function quickAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = quick.trim();
    if (!title) return;
    setQuickBusy(true);
    try {
      await api("/api/backlog", { method: "POST", ...json({ title, area: quickArea, priority: "medium", status: "idea" }) });
      setQuick("");
      setToast("Idea captured");
      await load();
    } catch (err) {
      if (!(err instanceof KeyRequiredError)) setToast(err instanceof Error ? err.message : "Failed");
    } finally {
      setQuickBusy(false);
    }
  }

  async function changeStatus(item: BacklogItem, status: string) {
    // optimistic
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status } : i)));
    try {
      await api(`/api/backlog?id=${encodeURIComponent(item.id)}`, { method: "PUT", ...json({ status }) });
    } catch (err) {
      if (!(err instanceof KeyRequiredError)) setToast(err instanceof Error ? err.message : "Failed");
      await load();
    }
  }

  const areaCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const i of items) c[i.area] = (c[i.area] ?? 0) + 1;
    return c;
  }, [items]);

  const categories = useMemo(() => [...new Set(items.map((i) => i.category).filter(Boolean))].sort(), [items]);

  const visible = items.filter((i) => {
    if (area && i.area !== area) return false;
    if (statusFilter === "all") return true;
    if (statusFilter === "open") return i.status !== "done" && i.status !== "dropped";
    return i.status === statusFilter;
  });

  const statusOrder = ["in-progress", "planned", "idea", "done", "dropped"];
  const prio = ["high", "medium", "low"];
  const sorted = [...visible].sort((a, b) => {
    const sd = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    if (sd !== 0) return sd;
    const pd = prio.indexOf(a.priority) - prio.indexOf(b.priority);
    if (pd !== 0) return pd;
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });

  const openCount = items.filter((i) => i.status !== "done" && i.status !== "dropped").length;

  if (loading) return <div className="text-center py-12 text-t-muted">Loading backlog…</div>;

  return (
    <div>
      {/* Quick capture — the phone path: title + area, nothing else */}
      <form onSubmit={quickAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={quick}
          onChange={(e) => setQuick(e.target.value)}
          placeholder="Capture an idea…"
          className="flex-1 min-w-0 px-3 py-2.5 text-base sm:text-sm border border-t-border rounded bg-t-card text-t-text focus:outline-none focus:border-t-blue"
          enterKeyHint="done"
        />
        <select
          value={quickArea}
          onChange={(e) => setQuickArea(e.target.value)}
          className="px-2 py-2 text-xs border border-t-border rounded bg-t-card text-t-text w-28 sm:w-36"
          aria-label="Area"
        >
          {AREAS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={quickBusy || !quick.trim()}
          className="px-3 py-2 text-sm font-semibold bg-t-text text-t-bg rounded disabled:opacity-40"
        >
          {quickBusy ? "…" : "Add"}
        </button>
      </form>

      <div className="flex items-center justify-between mb-3 gap-2">
        <h2 className="text-lg font-bold text-t-text">
          Backlog <span className="text-t-muted font-normal text-sm">({openCount} open · {items.length} total)</span>
        </h2>
        <button
          onClick={() => {
            setEditItem(null);
            setShowForm(true);
          }}
          className="px-3 py-1.5 text-xs font-semibold border border-t-text text-t-text rounded hover:bg-t-surface"
        >
          + Full form
        </button>
      </div>

      <AreaChips counts={areaCounts} selected={area} onSelect={selectArea} total={items.length} />

      <div className="flex gap-1.5 overflow-x-auto pb-2 mt-1 mb-4 [scrollbar-width:none]">
        {(["open", "in-progress", "planned", "idea", "done", "dropped", "all"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`shrink-0 px-2.5 py-1 text-[11px] rounded border ${
              statusFilter === s ? "bg-t-surface border-t-text text-t-text font-semibold" : "border-t-border text-t-muted"
            }`}
          >
            {s === "open" ? "Open" : s === "all" ? "All" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {sorted.length === 0 && <div className="text-center py-12 text-t-muted">Nothing here. Capture an idea above.</div>}

      <div className="space-y-2">
        {sorted.map((item) => (
          <div key={item.id} className="border border-t-border rounded-lg bg-t-card px-3 sm:px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase ${PRIORITY_STYLE[item.priority] ?? ""}`}>{item.priority}</span>
                  <span className={`font-semibold text-t-text ${item.status === "dropped" ? "line-through text-t-muted" : ""}`}>
                    {item.title}
                  </span>
                </div>
                {item.description && <p className="text-xs text-t-muted mt-1 whitespace-pre-line">{item.description}</p>}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <AreaBadge area={item.area} />
                  {item.category && <span className="text-[10px] font-mono text-t-muted">{item.category}</span>}
                  {item.createdAt && (
                    <span className="text-[10px] font-mono text-t-dim">{item.createdAt.slice(0, 10)}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <select
                  value={item.status}
                  onChange={(e) => changeStatus(item, e.target.value)}
                  className={`text-[11px] px-1.5 py-1 rounded border border-t-border ${STATUS_STYLE[item.status] ?? ""}`}
                  aria-label="Status"
                >
                  {BACKLOG_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setEditItem(item);
                    setShowForm(true);
                  }}
                  className="text-xs text-t-blue hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-t-text text-t-bg text-xs px-4 py-2 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}

      {showForm && (
        <BacklogForm item={editItem} categories={categories} onClose={() => setShowForm(false)} onSaved={load} />
      )}
    </div>
  );
}

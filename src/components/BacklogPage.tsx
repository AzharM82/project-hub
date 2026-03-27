import { useState, useEffect, useCallback } from "react";
import type { BacklogItem } from "../types.js";
import { BacklogForm } from "./BacklogForm.js";

const CATEGORY_COLORS: Record<string, string> = {
  "AI Agent": "bg-t-purple/10 text-t-purple border-t-purple/30",
  Dashboard: "bg-t-blue/10 text-t-blue border-t-blue/30",
  Tool: "bg-t-green/10 text-t-green border-t-green/30",
  Integration: "bg-t-amber/10 text-t-amber border-t-amber/30",
  Other: "bg-t-muted/10 text-t-muted border-t-muted/30",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "text-t-red",
  medium: "text-t-amber",
  low: "text-t-muted",
};

const STATUS_LABELS: Record<string, string> = {
  idea: "Idea",
  planned: "Planned",
  "in-progress": "In Progress",
  done: "Done",
};

export function BacklogPage() {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<BacklogItem | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/backlog");
      const data = await res.json();
      setItems(data as BacklogItem[]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function handleDelete(id: string) {
    await fetch(`/api/backlog?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    fetchItems();
  }

  async function handleStatusChange(item: BacklogItem, newStatus: string) {
    await fetch(`/api/backlog?id=${encodeURIComponent(item.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchItems();
  }

  if (loading) {
    return <div className="text-center py-12 text-t-muted">Loading backlog...</div>;
  }

  // Group by status
  const grouped: Record<string, BacklogItem[]> = {};
  for (const item of items) {
    const key = item.status || "idea";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  const statusOrder = ["idea", "planned", "in-progress", "done"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl font-bold text-t-text"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Backlog ({items.length} ideas)
        </h2>
        <button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="px-4 py-2 text-sm font-semibold bg-t-text text-t-bg rounded hover:opacity-90 transition-opacity"
        >
          + Add Idea
        </button>
      </div>

      {statusOrder.map((status) => {
        const group = grouped[status];
        if (!group || group.length === 0) return null;

        return (
          <div key={status} className="mb-8">
            <h3
              className="text-sm font-bold uppercase tracking-widest text-t-muted mb-3 pb-1 border-b border-t-border"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {STATUS_LABELS[status] ?? status} ({group.length})
            </h3>

            <div className="space-y-3">
              {group.map((item) => (
                <div
                  key={item.id}
                  className="bg-t-card border border-t-border rounded p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="font-bold text-t-text">{item.title}</h4>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                            CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.Other
                          }`}
                        >
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-bold uppercase ${PRIORITY_COLORS[item.priority] ?? ""}`}>
                          {item.priority}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-t-muted leading-relaxed">{item.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Status dropdown */}
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item, e.target.value)}
                        className="text-[11px] px-2 py-1 border border-t-border rounded bg-t-bg text-t-text"
                      >
                        {statusOrder.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => { setEditItem(item); setShowForm(true); }}
                        className="text-[11px] text-t-blue hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-[11px] text-t-red hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {items.length === 0 && (
        <div className="text-center py-12 text-t-muted">
          No backlog items yet. Click "Add Idea" to get started.
        </div>
      )}

      {showForm && (
        <BacklogForm
          item={editItem}
          onClose={() => setShowForm(false)}
          onSaved={fetchItems}
        />
      )}
    </div>
  );
}

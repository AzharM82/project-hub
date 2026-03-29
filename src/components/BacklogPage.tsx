import { useState, useEffect, useCallback } from "react";
import type { BacklogItem } from "../types.js";
import { BacklogForm } from "./BacklogForm.js";

const CATEGORY_COLORS: Record<string, string> = {
  "AI Agent": "text-t-purple",
  Dashboard: "text-t-blue",
  Tool: "text-t-green",
  Integration: "text-t-amber",
  Other: "text-t-muted",
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

  if (loading) return <div className="text-center py-12 text-t-muted">Loading backlog...</div>;

  const statusOrder = ["idea", "planned", "in-progress", "done"];

  // Sort: by priority (high first), then by status order
  const sorted = [...items].sort((a, b) => {
    const prio = ["high", "medium", "low"];
    const pd = prio.indexOf(a.priority) - prio.indexOf(b.priority);
    if (pd !== 0) return pd;
    return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-t-text">
          Backlog ({items.length})
        </h2>
        <button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="px-3 py-1.5 text-xs font-semibold bg-t-text text-t-bg rounded hover:opacity-90 transition-opacity"
        >
          + Add Idea
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-t-border text-left">
              <th className="py-2 pr-3 text-xs font-semibold text-t-muted">Title</th>
              <th className="py-2 pr-3 text-xs font-semibold text-t-muted">Description</th>
              <th className="py-2 pr-3 text-xs font-semibold text-t-muted">Category</th>
              <th className="py-2 pr-3 text-xs font-semibold text-t-muted">Priority</th>
              <th className="py-2 pr-3 text-xs font-semibold text-t-muted">Status</th>
              <th className="py-2 text-xs font-semibold text-t-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <tr key={item.id} className="border-b border-t-border/50 hover:bg-t-surface/50">
                <td className="py-2.5 pr-3 font-semibold text-t-text whitespace-nowrap">
                  {item.title}
                </td>
                <td className="py-2.5 pr-3 text-xs text-t-muted max-w-xs">
                  {item.description}
                </td>
                <td className="py-2.5 pr-3 whitespace-nowrap">
                  <span className={`text-xs font-semibold ${CATEGORY_COLORS[item.category] ?? "text-t-muted"}`}>
                    {item.category}
                  </span>
                </td>
                <td className="py-2.5 pr-3 whitespace-nowrap">
                  <span className={`text-xs font-bold uppercase ${PRIORITY_COLORS[item.priority] ?? ""}`}>
                    {item.priority}
                  </span>
                </td>
                <td className="py-2.5 pr-3 whitespace-nowrap">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item, e.target.value)}
                    className="text-xs px-1.5 py-1 border border-t-border rounded bg-t-bg text-t-text"
                  >
                    {statusOrder.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2.5 whitespace-nowrap">
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => { setEditItem(item); setShowForm(true); }}
                      className="text-t-blue hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-t-red hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-t-muted">
          No backlog items yet. Click "+ Add Idea" to get started.
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

import { useState, useEffect, useCallback } from "react";
import type { MaintenanceTask } from "../types.js";
import { api, json } from "../lib/api.js";
import { MaintenanceForm } from "./MaintenanceForm.js";

const CATEGORY_COLORS: Record<string, string> = {
  "Secret/Key": "text-t-red",
  "OAuth/Auth": "text-t-purple",
  Certificate: "text-t-amber",
  Subscription: "text-t-blue",
  "Domain/DNS": "text-t-green",
  Other: "text-t-muted",
};

const STATUS_STYLES: Record<string, string> = {
  overdue: "bg-red-100 text-red-800",
  upcoming: "bg-amber-100 text-amber-800",
  done: "bg-green-100 text-green-800",
};

function getDaysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const due = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDueDate(dateStr: string): string {
  if (!dateStr) return "—";
  const days = getDaysUntil(dateStr);
  const formatted = new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (days === null) return formatted;
  if (days < 0) return `${formatted} (${Math.abs(days)}d overdue)`;
  if (days === 0) return `${formatted} (today)`;
  if (days <= 30) return `${formatted} (${days}d)`;
  return formatted;
}

function getDueDateColor(dateStr: string, status: string): string {
  if (status === "done") return "text-t-muted";
  if (!dateStr) return "text-t-text";
  const days = getDaysUntil(dateStr);
  if (days === null) return "text-t-text";
  if (days < 0) return "text-t-red font-bold";
  if (days <= 7) return "text-t-red";
  if (days <= 30) return "text-t-amber";
  return "text-t-text";
}

export function AdminPage() {
  const [items, setItems] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<MaintenanceTask | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/maintenance");
      const data = await res.json();
      setItems(data as MaintenanceTask[]);
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
    await api(`/api/maintenance?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    fetchItems();
  }

  async function handleStatusChange(item: MaintenanceTask, newStatus: string) {
    await api(`/api/maintenance?id=${encodeURIComponent(item.id)}`, { method: "PUT", ...json({ status: newStatus }) });
    fetchItems();
  }

  if (loading) return <div className="text-center py-12 text-t-muted">Loading maintenance tasks...</div>;

  const overdue = items.filter((i) => i.status === "overdue").length;
  const upcoming = items.filter((i) => i.status === "upcoming").length;
  const done = items.filter((i) => i.status === "done").length;

  // Auto-detect overdue based on date
  const displayItems = items.map((item) => {
    if (item.status === "done") return item;
    const days = getDaysUntil(item.dueDate);
    if (days !== null && days < 0 && item.status !== "overdue") {
      return { ...item, status: "overdue" };
    }
    return item;
  });

  const activeItems = displayItems.filter((i) => i.status !== "done");
  const doneItems = displayItems.filter((i) => i.status === "done");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-t-text">
          Maintenance Tasks
        </h2>
        <button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="px-3 py-1.5 text-xs font-semibold bg-t-text text-t-bg rounded hover:opacity-90 transition-opacity"
        >
          + Add Task
        </button>
      </div>

      {/* Summary */}
      <div className="flex gap-4 mb-5 text-xs">
        {overdue > 0 && (
          <span className="px-2.5 py-1 rounded bg-red-100 text-red-800 font-semibold">
            {overdue} Overdue
          </span>
        )}
        <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 font-semibold">
          {upcoming} Upcoming
        </span>
        <span className="px-2.5 py-1 rounded bg-green-100 text-green-800 font-semibold">
          {done} Done
        </span>
      </div>

      {/* Active Tasks Table */}
      {activeItems.length > 0 && (
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-t-border text-left">
                <th className="py-2 pr-3 text-xs font-semibold text-t-muted">Project</th>
                <th className="py-2 pr-3 text-xs font-semibold text-t-muted">Task</th>
                <th className="py-2 pr-3 text-xs font-semibold text-t-muted">Category</th>
                <th className="py-2 pr-3 text-xs font-semibold text-t-muted">Due Date</th>
                <th className="py-2 pr-3 text-xs font-semibold text-t-muted">Status</th>
                <th className="py-2 text-xs font-semibold text-t-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeItems.map((item) => (
                <tr key={item.id} className="border-b border-t-border/50 hover:bg-t-surface/50">
                  <td className="py-2.5 pr-3 font-semibold text-t-text whitespace-nowrap">
                    {item.project}
                  </td>
                  <td className="py-2.5 pr-3 text-t-text">
                    <div>{item.task}</div>
                    {item.notes && (
                      <div className="text-xs text-t-muted mt-0.5">{item.notes}</div>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">
                    <span className={`text-xs font-semibold ${CATEGORY_COLORS[item.category] ?? "text-t-muted"}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className={`py-2.5 pr-3 whitespace-nowrap text-xs ${getDueDateColor(item.dueDate, item.status)}`}>
                    {formatDueDate(item.dueDate)}
                  </td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item, e.target.value)}
                      className={`text-xs px-1.5 py-1 border border-t-border rounded ${STATUS_STYLES[item.status] ?? "bg-t-bg text-t-text"}`}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="overdue">Overdue</option>
                      <option value="done">Done</option>
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
      )}

      {/* Completed Tasks */}
      {doneItems.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-t-muted mb-2 uppercase tracking-wider">Completed</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse opacity-60">
              <tbody>
                {doneItems.map((item) => (
                  <tr key={item.id} className="border-b border-t-border/30">
                    <td className="py-2 pr-3 text-t-muted whitespace-nowrap">{item.project}</td>
                    <td className="py-2 pr-3 text-t-muted line-through">{item.task}</td>
                    <td className="py-2 pr-3 text-xs text-t-muted whitespace-nowrap">{item.category}</td>
                    <td className="py-2 pr-3 text-xs text-t-muted whitespace-nowrap">
                      {formatDueDate(item.dueDate)}
                    </td>
                    <td className="py-2 whitespace-nowrap">
                      <div className="flex gap-2 text-xs">
                        <button
                          onClick={() => handleStatusChange(item, "upcoming")}
                          className="text-t-blue hover:underline"
                        >
                          Reopen
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
        </>
      )}

      {items.length === 0 && (
        <div className="text-center py-12 text-t-muted">
          No maintenance tasks yet. Click "+ Add Task" to track renewals, keys, and secrets.
        </div>
      )}

      {showForm && (
        <MaintenanceForm
          item={editItem}
          onClose={() => setShowForm(false)}
          onSaved={fetchItems}
        />
      )}
    </div>
  );
}

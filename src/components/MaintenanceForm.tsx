import { useState } from "react";
import type { MaintenanceTask } from "../types.js";

interface MaintenanceFormProps {
  item?: MaintenanceTask | null;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES = ["Secret/Key", "OAuth/Auth", "Certificate", "Subscription", "Domain/DNS", "Other"];
const STATUSES = ["upcoming", "overdue", "done"];
const PROJECTS = [
  "MTF Reversal Scanner",
  "Sector Rotation",
  "Ramadan Max Rewards",
  "Project Hub",
  "Should I Be Trading",
  "Azure Cost Manager",
  "OpenClaw",
  "StockAgentHub",
  "Other",
];

export function MaintenanceForm({ item, onClose, onSaved }: MaintenanceFormProps) {
  const [project, setProject] = useState(item?.project ?? "");
  const [task, setTask] = useState(item?.task ?? "");
  const [category, setCategory] = useState(item?.category ?? "Secret/Key");
  const [dueDate, setDueDate] = useState(item?.dueDate ?? "");
  const [status, setStatus] = useState(item?.status ?? "upcoming");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const isEdit = !!item;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!task.trim() || !project.trim()) return;

    setSaving(true);
    try {
      if (isEdit) {
        await fetch(`/api/maintenance?id=${encodeURIComponent(item.id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project, task, category, dueDate, status, notes }),
        });
      } else {
        await fetch("/api/maintenance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project, task, category, dueDate, status, notes }),
        });
      }
      onSaved();
      onClose();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-t-card border border-t-border rounded-lg w-full max-w-lg shadow-lg">
        <div className="px-6 py-4 border-b border-t-border">
          <h3
            className="text-lg font-bold text-t-text"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {isEdit ? "Edit Task" : "New Maintenance Task"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-t-muted mb-1 uppercase tracking-wider">
                Project
              </label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-t-border rounded bg-t-bg text-t-text focus:outline-none focus:border-t-blue"
                required
              >
                <option value="">Select project...</option>
                {PROJECTS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-t-muted mb-1 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-t-border rounded bg-t-bg text-t-text focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-t-muted mb-1 uppercase tracking-wider">
              Task / Action Required
            </label>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-t-border rounded bg-t-bg text-t-text focus:outline-none focus:border-t-blue"
              placeholder="e.g. Renew Polygon API key"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-t-muted mb-1 uppercase tracking-wider">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-t-border rounded bg-t-bg text-t-text focus:outline-none focus:border-t-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-t-muted mb-1 uppercase tracking-wider">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-t-border rounded bg-t-bg text-t-text focus:outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-t-muted mb-1 uppercase tracking-wider">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-t-border rounded bg-t-bg text-t-text focus:outline-none focus:border-t-blue resize-none"
              placeholder="Where to renew, link, etc."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-t-muted hover:text-t-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !task.trim() || !project.trim()}
              className="px-4 py-2 text-sm font-semibold bg-t-text text-t-bg rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Update" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

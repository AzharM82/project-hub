import { useState } from "react";
import type { BacklogItem } from "../types.js";

interface BacklogFormProps {
  item?: BacklogItem | null;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES = ["AI Agent", "Dashboard", "Tool", "Integration", "Other"];
const PRIORITIES = ["high", "medium", "low"];
const STATUSES = ["idea", "planned", "in-progress", "done"];

export function BacklogForm({ item, onClose, onSaved }: BacklogFormProps) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [category, setCategory] = useState(item?.category ?? "Tool");
  const [priority, setPriority] = useState(item?.priority ?? "medium");
  const [status, setStatus] = useState(item?.status ?? "idea");
  const [saving, setSaving] = useState(false);

  const isEdit = !!item;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      if (isEdit) {
        await fetch(`/api/backlog?id=${encodeURIComponent(item.id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, category, priority, status }),
        });
      } else {
        await fetch("/api/backlog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, category, priority, status }),
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
            {isEdit ? "Edit Idea" : "New Idea"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-t-muted mb-1 uppercase tracking-wider">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-t-border rounded bg-t-bg text-t-text focus:outline-none focus:border-t-blue"
              placeholder="e.g. Morning War Room Agent"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-t-muted mb-1 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-t-border rounded bg-t-bg text-t-text focus:outline-none focus:border-t-blue resize-none"
              placeholder="What should it do?"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
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

            <div>
              <label className="block text-xs font-semibold text-t-muted mb-1 uppercase tracking-wider">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-t-border rounded bg-t-bg text-t-text focus:outline-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
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
              disabled={saving || !title.trim()}
              className="px-4 py-2 text-sm font-semibold bg-t-text text-t-bg rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Update" : "Add Idea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

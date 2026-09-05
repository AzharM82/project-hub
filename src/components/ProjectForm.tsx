import { useState } from "react";
import { AREAS, PROJECT_STATUSES, type Project } from "../types.js";
import { api, json, KeyRequiredError } from "../lib/api.js";

interface ProjectFormProps {
  item?: Project | null;
  categories: string[];
  onClose: () => void;
  onSaved: () => void;
}

const inputCls =
  "w-full px-3 py-2 text-base sm:text-sm border border-t-border rounded bg-t-bg text-t-text focus:outline-none focus:border-t-blue";
const labelCls = "block text-xs font-semibold text-t-muted mb-1 uppercase tracking-wider";

export function ProjectForm({ item, categories, onClose, onSaved }: ProjectFormProps) {
  const [name, setName] = useState(item?.name ?? "");
  const [area, setArea] = useState(item?.area ?? "Trading");
  const [category, setCategory] = useState(item?.category ?? "");
  const [status, setStatus] = useState(item?.status ?? "local");
  const [purpose, setPurpose] = useState(item?.purpose ?? "");
  const [stack, setStack] = useState(item?.stack ?? "");
  const [url, setUrl] = useState(item?.url ?? "");
  const [github, setGithub] = useState(item?.github ?? "");
  const [cost, setCost] = useState(item?.cost ?? "$0/mo");
  const [details, setDetails] = useState(item?.details ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!item;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    const body = { name, area, category: category.trim() || "Other", status, purpose, stack, url, github, cost, details };
    try {
      if (isEdit) {
        await api(`/api/projects?id=${encodeURIComponent(item.id)}`, { method: "PUT", ...json(body) });
      } else {
        await api("/api/projects", { method: "POST", ...json(body) });
      }
      onSaved();
      onClose();
    } catch (err) {
      if (!(err instanceof KeyRequiredError)) setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const [confirmDelete, setConfirmDelete] = useState(false);
  async function handleDelete() {
    if (!item) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setSaving(true);
    try {
      await api(`/api/projects?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
      onSaved();
      onClose();
    } catch (err) {
      if (!(err instanceof KeyRequiredError)) setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-t-card border border-t-border rounded-t-lg sm:rounded-lg w-full max-w-2xl shadow-lg max-h-[92vh] flex flex-col">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-t-border flex items-center justify-between">
          <h3 className="text-lg font-bold text-t-text" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {isEdit ? "Edit Project" : "New Project"}
          </h3>
          <button type="button" onClick={onClose} className="text-t-muted text-xl leading-none px-2" aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 overflow-y-auto">
          <div>
            <label className={labelCls}>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required autoFocus={!isEdit} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Area</label>
              <select value={area} onChange={(e) => setArea(e.target.value)} className={inputCls}>
                {AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <input
                type="text"
                list="project-categories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}
                placeholder="e.g. Scanners & Signals"
              />
              <datalist id="project-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Purpose</label>
            <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="One or two sentences on what it does" />
          </div>

          <div>
            <label className={labelCls}>Stack</label>
            <input type="text" value={stack} onChange={(e) => setStack(e.target.value)} className={inputCls} placeholder="React 19, Node Azure Functions, …" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Live URL</label>
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className={inputCls} placeholder="https://…" />
            </div>
            <div>
              <label className={labelCls}>GitHub</label>
              <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} className={inputCls} placeholder="https://github.com/…" />
            </div>
            <div>
              <label className={labelCls}>Cost</label>
              <input type="text" value={cost} onChange={(e) => setCost(e.target.value)} className={inputCls} placeholder="$0/mo" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Details (one bullet per line)</label>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={5} className={`${inputCls} font-mono text-xs`} />
          </div>

          {error && <div className="text-xs text-t-red">{error}</div>}

          <div className="flex items-center justify-between gap-3 pt-1">
            {isEdit ? (
              <button type="button" onClick={handleDelete} disabled={saving} className="text-xs text-t-red hover:underline">
                {confirmDelete ? "Tap again to confirm delete" : "Delete"}
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-t-muted hover:text-t-text">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="px-4 py-2 text-sm font-semibold bg-t-text text-t-bg rounded hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving…" : isEdit ? "Update" : "Add Project"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

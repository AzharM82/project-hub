import { useState, useEffect, useCallback, useMemo } from "react";
import type { Project } from "../types.js";
import { AreaChips } from "./AreaChips.js";
import { ProjectForm } from "./ProjectForm.js";

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  live: { label: "LIVE", cls: "bg-green-100 text-green-800 border-green-300" },
  paper: { label: "PAPER", cls: "bg-amber-100 text-amber-800 border-amber-300" },
  local: { label: "LOCAL", cls: "bg-blue-100 text-blue-800 border-blue-300" },
  "repo-only": { label: "REPO ONLY", cls: "bg-gray-100 text-gray-600 border-gray-300" },
  archived: { label: "ARCHIVED", cls: "bg-red-50 text-red-700 border-red-200" },
};

// Preferred order inside each area; anything unlisted sorts after, alphabetically. "Archived" always last.
const CATEGORY_ORDER = [
  "Day Trade Algo",
  "Auto-Execution",
  "Scanners & Signals",
  "Decision Dashboards",
  "Research",
  "Playbooks",
  "Journals",
  "Revenue SaaS",
  "AI & Learning",
  "Content",
  "Productivity Apps",
  "Journals & Notes",
  "Personal Finance",
  "Infrastructure & Tools",
  "Security",
  "Faith Apps",
];

const AREA_BLURB: Record<string, string> = {
  Trading: "Signals, execution, dashboards, journals and the SaaS built around the trading practice.",
  Learning: "Tools and content for learning — AI, skills, and teaching material.",
  Productivity: "Everyday apps: tasks, notes, dictation, personal finance.",
  Infrastructure: "Plumbing that keeps everything running — agents, cost, security.",
  "Personal & Faith": "Apps for family and worship.",
};

function catRank(c: string): number {
  if (c === "Archived") return 999;
  const i = CATEGORY_ORDER.indexOf(c);
  return i === -1 ? 500 : i;
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [area, setArea] = useState<string>(() => {
    try {
      return localStorage.getItem("hub.projects.area") ?? "";
    } catch {
      return "";
    }
  });
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Project | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      setProjects((await res.json()) as Project[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function selectArea(a: string) {
    setArea(a);
    try {
      localStorage.setItem("hub.projects.area", a);
    } catch {
      // ignore
    }
  }

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const areaCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of projects) c[p.area] = (c[p.area] ?? 0) + 1;
    return c;
  }, [projects]);

  const categories = useMemo(() => [...new Set(projects.map((p) => p.category).filter(Boolean))].sort(), [projects]);

  const q = query.trim().toLowerCase();
  const visible = projects.filter((p) => {
    if (area && p.area !== area) return false;
    if (!showArchived && p.status === "archived" && !q) return false;
    if (!q) return true;
    return [p.name, p.purpose, p.stack, p.category, p.details].some((s) => (s ?? "").toLowerCase().includes(q));
  });

  // Group: area → category
  const groups = new Map<string, Map<string, Project[]>>();
  for (const p of visible) {
    const a = p.area || "Trading";
    const c = p.category || "Other";
    if (!groups.has(a)) groups.set(a, new Map());
    const g = groups.get(a)!;
    if (!g.has(c)) g.set(c, []);
    g.get(c)!.push(p);
  }
  const areaOrder = ["Trading", "Learning", "Productivity", "Infrastructure", "Personal & Faith"];
  const orderedAreas = [...groups.keys()].sort((a, b) => areaOrder.indexOf(a) - areaOrder.indexOf(b));

  const live = projects.filter((p) => p.status === "live").length;
  const archivedCount = projects.filter((p) => p.status === "archived").length;
  const totalCost = projects.reduce((sum, p) => {
    const m = (p.cost || "").match(/\$(\d+)/);
    return sum + (m ? parseInt(m[1], 10) : 0);
  }, 0);

  if (loading) return <div className="text-center py-12 text-t-muted">Loading projects…</div>;
  if (error) return <div className="text-center py-12 text-t-red">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-2">
        <h2 className="text-lg font-bold text-t-text">
          Projects <span className="text-t-muted font-normal text-sm">({projects.length})</span>
        </h2>
        <button
          onClick={() => {
            setEditItem(null);
            setShowForm(true);
          }}
          className="px-3 py-1.5 text-xs font-semibold bg-t-text text-t-bg rounded hover:opacity-90"
        >
          + Add Project
        </button>
      </div>
      <div className="text-xs text-t-muted font-mono mb-3">
        {live} live · {archivedCount} archived · ${totalCost}/mo Azure
      </div>

      <AreaChips counts={areaCounts} selected={area} onSelect={selectArea} total={projects.length} />

      <div className="flex items-center gap-3 mt-2 mb-5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, stack, details…"
          className="flex-1 px-3 py-2 text-base sm:text-sm border border-t-border rounded bg-t-card text-t-text focus:outline-none focus:border-t-blue"
        />
        <label className="text-xs text-t-muted flex items-center gap-1 shrink-0">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          archived
        </label>
      </div>

      {visible.length === 0 && <div className="text-center py-12 text-t-muted">Nothing matches.</div>}

      {orderedAreas.map((a) => {
        const cats = [...groups.get(a)!.entries()].sort(([x], [y]) => catRank(x) - catRank(y) || x.localeCompare(y));
        const n = cats.reduce((s, [, ps]) => s + ps.length, 0);
        return (
          <section key={a} className="mb-8">
            <h3
              className="text-xl font-black text-t-text border-b-2 border-t-text pb-1 mb-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {a} <span className="text-t-muted font-normal text-sm">({n})</span>
            </h3>
            {AREA_BLURB[a] && <p className="text-xs text-t-muted mb-3 italic">{AREA_BLURB[a]}</p>}
            {cats.map(([c, ps]) => (
              <div key={c} className="mb-5">
                <h4 className="text-sm font-bold text-t-text uppercase tracking-wider mb-2">
                  {c} <span className="text-t-dim font-normal normal-case">({ps.length})</span>
                </h4>
                <div className="space-y-2">
                  {ps
                    .sort((x, y) => x.name.localeCompare(y.name))
                    .map((p) => (
                      <ProjectCard
                        key={p.id}
                        p={p}
                        open={expanded.has(p.id)}
                        onToggle={() => toggle(p.id)}
                        onEdit={() => {
                          setEditItem(p);
                          setShowForm(true);
                        }}
                      />
                    ))}
                </div>
              </div>
            ))}
          </section>
        );
      })}

      {showForm && (
        <ProjectForm item={editItem} categories={categories} onClose={() => setShowForm(false)} onSaved={load} />
      )}
    </div>
  );
}

function ProjectCard({ p, open, onToggle, onEdit }: { p: Project; open: boolean; onToggle: () => void; onEdit: () => void }) {
  const badge = STATUS_BADGE[p.status] ?? STATUS_BADGE["repo-only"];
  const hasDetails = (p.details || "").trim().length > 0;
  return (
    <div className="border border-t-border rounded-lg bg-t-card px-3 sm:px-4 py-3">
      <div
        className={`flex items-start justify-between gap-3 ${hasDetails ? "cursor-pointer" : ""}`}
        onClick={hasDetails ? onToggle : undefined}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-t-text">{p.name}</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badge.cls}`}>{badge.label}</span>
            {p.cost && p.cost !== "$0/mo" && <span className="text-[10px] font-mono text-t-muted">{p.cost}</span>}
          </div>
          <p className="text-xs text-t-muted mt-1">{p.purpose}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-xs">
          {p.url && (
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-t-blue hover:underline" onClick={(e) => e.stopPropagation()}>
              Live
            </a>
          )}
          {p.github && (
            <a href={p.github} target="_blank" rel="noopener noreferrer" className="text-t-blue hover:underline" onClick={(e) => e.stopPropagation()}>
              GitHub
            </a>
          )}
          <button
            className="text-t-muted hover:text-t-text"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </button>
          {hasDetails && <span className="text-t-muted select-none w-4 text-center">{open ? "−" : "+"}</span>}
        </div>
      </div>

      {hasDetails && open ? (
        <div className="mt-3 pt-3 border-t border-t-border/60">
          <ul className="list-disc pl-5 space-y-1">
            {p.details
              .split("\n")
              .filter(Boolean)
              .map((line, i) => (
                <li key={i} className="text-xs text-t-text/90 leading-relaxed">
                  {line}
                </li>
              ))}
          </ul>
          <div className="text-[10px] text-t-muted font-mono mt-3">{p.stack}</div>
        </div>
      ) : (
        p.stack && <div className="text-[10px] text-t-muted font-mono mt-2 truncate">{p.stack}</div>
      )}
    </div>
  );
}

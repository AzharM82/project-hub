import { useState, useEffect } from "react";
import type { Project } from "../types.js";

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  live: { label: "LIVE", cls: "bg-green-100 text-green-800 border-green-300" },
  paper: { label: "PAPER MODE", cls: "bg-amber-100 text-amber-800 border-amber-300" },
  local: { label: "LOCAL", cls: "bg-blue-100 text-blue-800 border-blue-300" },
  "repo-only": { label: "REPO ONLY", cls: "bg-gray-100 text-gray-600 border-gray-300" },
  archived: { label: "ARCHIVED", cls: "bg-red-50 text-red-700 border-red-200" },
};

const CATEGORY_ORDER = [
  "Day Trade Algo",
  "Auto-Execution",
  "Scanners & Signals",
  "Decision Dashboards",
  "Journals",
  "Revenue SaaS",
  "Infrastructure & Tools",
  "Other Apps",
  "Archived",
];

const CATEGORY_BLURB: Record<string, string> = {
  "Day Trade Algo": "The current focus — DTSWAI consolidates the best of StockAgentHub, the chart-truth OCR scanner, and MTF portal patterns.",
  "Auto-Execution": "Systems that place (or paper-place) real orders.",
  "Scanners & Signals": "Signal generation — chart-truth OCR, EOD scanners, vision experiments, TradingView bridge.",
  "Decision Dashboards": "Market context: should I trade today, where is rotation, what moves pre-market.",
  Journals: "Recording and reviewing the trades.",
  "Revenue SaaS": "Apps with paying users.",
  "Infrastructure & Tools": "Plumbing that keeps everything running.",
  "Other Apps": "Non-trading apps.",
  Archived: "Lineage — decommissioned, absorbed, or superseded.",
};

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data as Project[]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-12 text-t-muted">Loading projects...</div>;
  if (error) return <div className="text-center py-12 text-t-red">{error}</div>;

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const byCategory = new Map<string, Project[]>();
  for (const p of projects) {
    const cat = p.category || "Other Apps";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(p);
  }
  const categories = [
    ...CATEGORY_ORDER.filter((c) => byCategory.has(c)),
    ...[...byCategory.keys()].filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  const live = projects.filter((p) => p.status === "live").length;
  const paper = projects.filter((p) => p.status === "paper").length;
  const localCount = projects.filter((p) => p.status === "local").length;
  const archived = projects.filter((p) => p.status === "archived").length;
  const totalCost = projects.reduce((sum, p) => {
    const m = (p.cost || "").match(/\$(\d+)/);
    return sum + (m ? parseInt(m[1], 10) : 0);
  }, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h2 className="text-lg font-bold text-t-text">Projects ({projects.length})</h2>
        <span className="text-xs text-t-muted font-mono">
          {live} live &middot; {paper} paper &middot; {localCount} local &middot; {archived} archived &middot; ${totalCost}/mo Azure
        </span>
      </div>

      {categories.map((cat) => (
        <CategorySection
          key={cat}
          title={cat}
          blurb={CATEGORY_BLURB[cat]}
          projects={byCategory.get(cat)!}
          expanded={expanded}
          onToggle={toggle}
        />
      ))}
    </div>
  );
}

function CategorySection({
  title,
  blurb,
  projects,
  expanded,
  onToggle,
}: {
  title: string;
  blurb?: string;
  projects: Project[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="mb-8">
      <h3
        className="text-base font-bold text-t-text border-b-2 border-t-text pb-1 mb-1"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {title} <span className="text-t-muted font-normal text-sm">({projects.length})</span>
      </h3>
      {blurb && <p className="text-xs text-t-muted mb-3 italic">{blurb}</p>}

      <div className="space-y-3">
        {projects.map((p) => {
          const badge = STATUS_BADGE[p.status] ?? STATUS_BADGE["repo-only"];
          const hasDetails = (p.details || "").trim().length > 0;
          const isOpen = expanded.has(p.id);
          return (
            <div key={p.id} className="border border-t-border rounded-lg bg-t-surface/30 px-4 py-3">
              <div
                className={`flex items-start justify-between gap-3 ${hasDetails ? "cursor-pointer" : ""}`}
                onClick={hasDetails ? () => onToggle(p.id) : undefined}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-t-text">{p.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badge.cls}`}>
                      {badge.label}
                    </span>
                    {p.cost && p.cost !== "$0/mo" && (
                      <span className="text-[10px] font-mono text-t-muted">{p.cost}</span>
                    )}
                  </div>
                  <p className="text-xs text-t-muted mt-1">{p.purpose}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs">
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-t-blue hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Live
                    </a>
                  )}
                  {p.github && (
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-t-blue hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      GitHub
                    </a>
                  )}
                  {hasDetails && (
                    <span className="text-t-muted select-none w-4 text-center">{isOpen ? "−" : "+"}</span>
                  )}
                </div>
              </div>

              {hasDetails && isOpen && (
                <div className="mt-3 pt-3 border-t border-t-border/60">
                  <ul className="list-disc pl-5 space-y-1">
                    {p.details.split("\n").filter(Boolean).map((line, i) => (
                      <li key={i} className="text-xs text-t-text/90 leading-relaxed">
                        {line}
                      </li>
                    ))}
                  </ul>
                  <div className="text-[10px] text-t-muted font-mono mt-3">{p.stack}</div>
                </div>
              )}
              {(!hasDetails || !isOpen) && (
                <div className="text-[10px] text-t-muted font-mono mt-2 truncate">{p.stack}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

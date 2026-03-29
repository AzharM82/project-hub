import { useState, useEffect } from "react";
import type { Project } from "../types.js";

const STATUS_STYLE: Record<string, string> = {
  live: "text-t-green",
  archived: "text-t-muted",
  "repo-only": "text-t-muted",
};

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects?seed=true&reseed=true")
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

  const live = projects.filter((p) => p.status === "live");
  const archived = projects.filter((p) => p.status === "archived");
  const repoOnly = projects.filter((p) => p.status === "repo-only");
  const totalCost = projects.reduce((sum, p) => {
    const m = (p.cost || "").match(/\$(\d+)/);
    return sum + (m ? parseInt(m[1], 10) : 0);
  }, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-t-text">
          Projects ({projects.length})
        </h2>
        <span className="text-xs text-t-muted font-mono">
          {live.length} live &middot; {archived.length} archived &middot; {repoOnly.length} repo-only &middot; ${totalCost}/mo
        </span>
      </div>

      <ProjectTable title="Live" projects={live} />
      {archived.length > 0 && <ProjectTable title="Archived" projects={archived} />}
      {repoOnly.length > 0 && <ProjectTable title="Repo Only" projects={repoOnly} />}
    </div>
  );
}

function ProjectTable({ title, projects }: { title: string; projects: Project[] }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-t-muted mb-2">
        {title} ({projects.length})
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-t-border text-left">
              <th className="py-2 pr-3 text-xs font-semibold text-t-muted">Name</th>
              <th className="py-2 pr-3 text-xs font-semibold text-t-muted">Purpose</th>
              <th className="py-2 pr-3 text-xs font-semibold text-t-muted">Stack</th>
              <th className="py-2 pr-3 text-xs font-semibold text-t-muted">Cost</th>
              <th className="py-2 text-xs font-semibold text-t-muted">Links</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-t-border/50 hover:bg-t-surface/50">
                <td className="py-2.5 pr-3 whitespace-nowrap">
                  <span className={`font-semibold ${STATUS_STYLE[p.status] ?? "text-t-text"}`}>
                    {p.name}
                  </span>
                </td>
                <td className="py-2.5 pr-3 text-xs text-t-muted max-w-xs">
                  {p.purpose}
                </td>
                <td className="py-2.5 pr-3 text-[10px] text-t-muted font-mono max-w-[200px]">
                  {p.stack}
                </td>
                <td className="py-2.5 pr-3 text-xs font-mono text-t-muted whitespace-nowrap">
                  {p.cost}
                </td>
                <td className="py-2.5 whitespace-nowrap">
                  <div className="flex gap-2 text-xs">
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-t-blue hover:underline">
                        Live
                      </a>
                    )}
                    {p.github && (
                      <a href={p.github} target="_blank" rel="noopener noreferrer" className="text-t-blue hover:underline">
                        GitHub
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

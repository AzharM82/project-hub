import { useState, useEffect } from "react";
import type { Project } from "../types.js";

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects?seed=true")
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

  if (loading) {
    return <div className="text-center py-12 text-t-muted">Loading projects...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-t-red">{error}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl font-bold text-t-text"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Built Projects ({projects.length})
        </h2>
      </div>

      <div className="space-y-4">
        {projects.map((p) => (
          <div
            key={p.id}
            className="bg-t-card border border-t-border rounded p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3
                    className="text-lg font-bold text-t-text"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {p.name}
                  </h3>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      p.status === "live"
                        ? "bg-t-green/10 text-t-green border border-t-green/30"
                        : "bg-t-dim/20 text-t-muted border border-t-dim"
                    }`}
                  >
                    {p.status}
                  </span>
                  {p.cost && (
                    <span className="text-[10px] text-t-muted font-mono">{p.cost}</span>
                  )}
                </div>

                <p className="text-sm text-t-muted mb-3">{p.purpose}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.stack.split(", ").map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] font-mono px-1.5 py-0.5 bg-t-surface text-t-muted rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4 text-xs">
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-t-blue hover:underline"
                    >
                      Live URL
                    </a>
                  )}
                  {p.github && (
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-t-blue hover:underline"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

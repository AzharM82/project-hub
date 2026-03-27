import { useState } from "react";
import type { Page } from "./types.js";
import { Header } from "./components/Header.js";
import { ProjectsPage } from "./components/ProjectsPage.js";
import { BacklogPage } from "./components/BacklogPage.js";

export function App() {
  const [page, setPage] = useState<Page>("projects");

  return (
    <div className="min-h-screen bg-t-bg">
      <Header currentPage={page} onNavigate={setPage} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {page === "projects" && <ProjectsPage />}
        {page === "backlog" && <BacklogPage />}
      </main>
      <footer className="text-center text-t-muted text-xs py-4 border-t border-t-border">
        <span style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          Project Hub — Portfolio & Backlog Tracker
        </span>
      </footer>
    </div>
  );
}

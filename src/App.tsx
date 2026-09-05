import { useEffect, useState } from "react";
import type { Page } from "./types.js";
import { Header } from "./components/Header.js";
import { ProjectsPage } from "./components/ProjectsPage.js";
import { BacklogPage } from "./components/BacklogPage.js";
import { AdminPage } from "./components/AdminPage.js";
import { KeyGate } from "./components/KeyGate.js";
import { gateStatus, getWriteKey } from "./lib/api.js";

const PAGES: Page[] = ["projects", "backlog", "admin"];

function pageFromHash(): Page {
  const h = window.location.hash.replace("#", "") as Page;
  return PAGES.includes(h) ? h : "projects";
}

export function App() {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [keyOpen, setKeyOpen] = useState(false);
  const [hasKey, setHasKey] = useState(() => Boolean(getWriteKey()));
  const [gate, setGate] = useState<"open" | "locked" | "unknown">("unknown");

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    gateStatus().then(setGate);
  }, []);

  function navigate(p: Page) {
    window.location.hash = p;
    setPage(p);
  }

  return (
    <div className="min-h-screen bg-t-bg">
      <Header
        currentPage={page}
        onNavigate={navigate}
        hasKey={hasKey}
        gate={gate}
        onKeyClick={() => setKeyOpen(true)}
      />
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {page === "projects" && <ProjectsPage />}
        {page === "backlog" && <BacklogPage />}
        {page === "admin" && <AdminPage />}
      </main>
      <footer className="text-center text-t-muted text-xs py-4 border-t border-t-border">
        <span style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          Project Hub — Portfolio & Backlog Tracker
        </span>
      </footer>
      <KeyGate
        open={keyOpen}
        onClose={() => {
          setKeyOpen(false);
          setHasKey(Boolean(getWriteKey()));
        }}
      />
    </div>
  );
}

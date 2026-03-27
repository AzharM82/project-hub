import type { Page } from "../types.js";

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  return (
    <header className="border-b-2 border-t-text">
      {/* Masthead */}
      <div className="text-center py-5">
        <h1
          className="text-4xl font-black tracking-tight text-t-text"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Project Hub
        </h1>
        <div className="text-t-muted text-xs mt-1 tracking-widest uppercase">
          Portfolio & Backlog Tracker
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-8 pb-3">
        <button
          onClick={() => onNavigate("projects")}
          className={`text-sm font-semibold uppercase tracking-wider pb-1 transition-colors ${
            currentPage === "projects"
              ? "text-t-text border-b-2 border-t-text"
              : "text-t-muted hover:text-t-text"
          }`}
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Built Projects
        </button>
        <button
          onClick={() => onNavigate("backlog")}
          className={`text-sm font-semibold uppercase tracking-wider pb-1 transition-colors ${
            currentPage === "backlog"
              ? "text-t-text border-b-2 border-t-text"
              : "text-t-muted hover:text-t-text"
          }`}
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Backlog
        </button>
      </div>
    </header>
  );
}

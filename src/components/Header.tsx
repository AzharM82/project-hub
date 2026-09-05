import type { Page } from "../types.js";

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  hasKey: boolean;
  gate: "open" | "locked" | "unknown";
  onKeyClick: () => void;
}

const NAV: { page: Page; label: string; short: string }[] = [
  { page: "projects", label: "Built Projects", short: "Projects" },
  { page: "backlog", label: "Backlog", short: "Backlog" },
  { page: "admin", label: "Admin", short: "Admin" },
];

export function Header({ currentPage, onNavigate, hasKey, gate, onKeyClick }: HeaderProps) {
  const lockTitle =
    gate === "open" ? "Write gate is OPEN on the server (HUB_WRITE_KEY not set)" : hasKey ? "Key saved on this device" : "Enter write key";
  return (
    <header className="border-b-2 border-t-text sticky top-0 bg-t-bg/95 backdrop-blur z-40">
      <div className="max-w-5xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between py-2 sm:py-4">
          <div className="min-w-0">
            <h1
              className="text-2xl sm:text-4xl font-black tracking-tight text-t-text leading-none"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Project Hub
            </h1>
            <div className="hidden sm:block text-t-muted text-xs mt-1 tracking-widest uppercase">
              Portfolio & Backlog Tracker
            </div>
          </div>
          <button
            onClick={onKeyClick}
            title={lockTitle}
            aria-label={lockTitle}
            className={`text-lg px-2 py-1 rounded border ${
              gate === "open" ? "border-t-amber text-t-amber" : hasKey ? "border-t-green text-t-green" : "border-t-border text-t-muted"
            }`}
          >
            {gate === "open" ? "⚠" : hasKey ? "🔓" : "🔒"}
          </button>
        </div>

        <nav className="flex justify-center gap-6 sm:gap-8 pb-2 sm:pb-3">
          {NAV.map((n) => (
            <button
              key={n.page}
              onClick={() => onNavigate(n.page)}
              className={`text-xs sm:text-sm font-semibold uppercase tracking-wider pb-1 transition-colors ${
                currentPage === n.page ? "text-t-text border-b-2 border-t-text" : "text-t-muted hover:text-t-text"
              }`}
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              <span className="sm:hidden">{n.short}</span>
              <span className="hidden sm:inline">{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

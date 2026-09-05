import { AREAS } from "../types.js";

export const AREA_STYLE: Record<string, string> = {
  Trading: "bg-green-100 text-green-900 border-green-300",
  Learning: "bg-purple-100 text-purple-900 border-purple-300",
  Productivity: "bg-blue-100 text-blue-900 border-blue-300",
  Infrastructure: "bg-amber-100 text-amber-900 border-amber-300",
  "Personal & Faith": "bg-rose-100 text-rose-900 border-rose-300",
};

export function AreaBadge({ area }: { area: string }) {
  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${AREA_STYLE[area] ?? "bg-gray-100 text-gray-700 border-gray-300"}`}>
      {area}
    </span>
  );
}

interface AreaChipsProps {
  counts: Record<string, number>;
  selected: string; // "" = all
  onSelect: (area: string) => void;
  total: number;
}

/** Horizontal, scrollable filter row: All · Trading · Learning · … with counts. */
export function AreaChips({ counts, selected, onSelect, total }: AreaChipsProps) {
  const chip = (label: string, value: string, n: number) => {
    const active = selected === value;
    return (
      <button
        key={value || "all"}
        onClick={() => onSelect(value)}
        className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
          active ? "bg-t-text text-t-bg border-t-text" : "bg-t-card text-t-muted border-t-border hover:text-t-text"
        }`}
      >
        {label} <span className={active ? "opacity-70" : "text-t-dim"}>{n}</span>
      </button>
    );
  };
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:none]">
      {chip("All", "", total)}
      {AREAS.map((a) => chip(a, a, counts[a] ?? 0))}
    </div>
  );
}

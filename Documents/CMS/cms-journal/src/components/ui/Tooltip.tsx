import type { ReactNode } from "react";

/** Infobulle purement CSS : aucune dépendance, aucun état, aucun coût au rendu. */
export default function Tooltip({ label, side = "right", children }: { label: string; side?: "right" | "top"; children: ReactNode }) {
  const position = side === "right" ? "left-full top-1/2 ml-2 -translate-y-1/2" : "bottom-full left-1/2 mb-2 -translate-x-1/2";
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-[60] whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-caption font-medium text-ink-inverse opacity-0 shadow-md transition group-hover/tooltip:opacity-100 ${position}`}
      >
        {label}
      </span>
    </span>
  );
}

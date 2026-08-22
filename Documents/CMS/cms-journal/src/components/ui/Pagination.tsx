"use client";

import IconButton from "@/components/ui/IconButton";

type Props = {
  page: number;
  totalPages: number;
  total?: number;
  /** Nom de l'entité paginée, au singulier : « article », « commentaire »… */
  unit?: string;
  onChange: (page: number) => void;
};

/** Fenêtre glissante de 5 pages au maximum : la pagination ne doit jamais déborder. */
function pageWindow(page: number, totalPages: number) {
  const size = Math.min(5, totalPages);
  const start = Math.max(1, Math.min(page - 2, totalPages - size + 1));
  return Array.from({ length: size }, (_, index) => start + index);
}

export default function Pagination({ page, totalPages, total, unit = "élément", onChange }: Props) {
  const safeTotalPages = Math.max(1, totalPages);
  if (safeTotalPages <= 1 && total === undefined) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {total !== undefined && (
        <p className="text-body-sm text-ink-muted">
          <span className="tabular font-medium text-ink-soft">{total}</span> {unit}{total > 1 ? "s" : ""}
        </p>
      )}
      <div className="ml-auto flex items-center gap-1">
        <IconButton icon="chevronLeft" label="Page précédente" variant="surface" disabled={page <= 1} onClick={() => onChange(page - 1)} className="disabled:opacity-40" />
        {pageWindow(page, safeTotalPages).map((number) => (
          <button
            key={number}
            type="button"
            aria-current={number === page ? "page" : undefined}
            onClick={() => onChange(number)}
            className={`tabular size-8 rounded-full text-body-sm font-medium transition ${number === page ? "bg-brand text-white" : "text-ink-soft hover:bg-gray-100 hover:text-ink"}`}
          >
            {number}
          </button>
        ))}
        <IconButton icon="chevronRight" label="Page suivante" variant="surface" disabled={page >= safeTotalPages} onClick={() => onChange(page + 1)} className="disabled:opacity-40" />
      </div>
    </div>
  );
}

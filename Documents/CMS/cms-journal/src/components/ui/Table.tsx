"use client";

import type { ReactNode } from "react";

import EmptyState from "@/components/ui/EmptyState";
import Icon from "@/components/ui/Icon";
import Skeleton from "@/components/ui/Skeleton";

export type TableColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "right";
  /** Masquée sous `lg` : sert à alléger le tableau sans perdre la donnée en mobile. */
  secondary?: boolean;
};

type Props<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  empty?: ReactNode;
  loading?: boolean;
  skeletonRows?: number;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  /** Rendu mobile sur mesure. Sans lui, une carte est dérivée des colonnes. */
  card?: (row: T) => ReactNode;
};

/**
 * Tableau desktop aéré + repli automatique en liste de cartes sous `md`.
 * Le défilement horizontal n'est plus la stratégie mobile : les colonnes
 * deviennent des paires libellé / valeur, et les actions passent en pied de carte.
 */
export default function Table<T>({ columns, rows, rowKey, empty, loading = false, skeletonRows = 6, sortKey, sortDirection, onSort, card }: Props<T>) {
  const actionColumn = columns.find((column) => column.key === "actions");
  const contentColumns = columns.filter((column) => column.key !== "actions");
  const [leadColumn, ...restColumns] = contentColumns;

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="flex h-11 items-center gap-4 border-b border-line bg-gray-50 px-5">
          {columns.map((column) => <Skeleton key={column.key} className="h-2.5 w-16" />)}
        </div>
        {Array.from({ length: skeletonRows }, (_, index) => (
          <div key={index} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
            {columns.map((column, columnIndex) => (
              <Skeleton key={column.key} className={`h-3 ${columnIndex === 0 ? "w-48" : "w-20"}`} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return <div className="rounded-2xl border border-line bg-surface">{empty || <EmptyState title="Aucune donnée" />}</div>;
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead>
              <tr className="border-b border-line bg-gray-50">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-5 py-3 text-label font-medium text-ink-muted ${column.align === "right" ? "text-right" : ""} ${column.secondary ? "hidden lg:table-cell" : ""}`}
                  >
                    {column.sortable ? (
                      <button type="button" onClick={() => onSort?.(column.key)} className="inline-flex items-center gap-1 hover:text-ink">
                        {column.label}
                        <Icon name={sortKey === column.key && sortDirection === "asc" ? "chevronUp" : "chevronDown"} size={12} className={sortKey === column.key ? "opacity-100" : "opacity-30"} />
                      </button>
                    ) : column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={rowKey(row)} className="border-b border-line transition last:border-0 hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-5 py-3.5 align-middle text-ink-soft ${column.align === "right" ? "text-right" : ""} ${column.secondary ? "hidden lg:table-cell" : ""}`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div key={rowKey(row)} className="rounded-2xl border border-line bg-surface p-4">
            {card ? card(row) : (
              <>
                {leadColumn && <div className="text-body font-medium text-ink">{leadColumn.render(row)}</div>}
                <dl className="mt-3 space-y-2">
                  {restColumns.map((column) => (
                    <div key={column.key} className="flex items-start justify-between gap-4">
                      <dt className="text-caption text-ink-muted">{column.label}</dt>
                      <dd className="min-w-0 text-right text-body-sm text-ink-soft">{column.render(row)}</dd>
                    </div>
                  ))}
                </dl>
                {actionColumn && <div className="mt-3 flex justify-end border-t border-line pt-3">{actionColumn.render(row)}</div>}
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

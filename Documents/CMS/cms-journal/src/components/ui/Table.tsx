"use client";

import type { ReactNode } from "react";

export type TableColumn<T> = { key: string; label: string; render: (row: T) => ReactNode; sortable?: boolean };
type Props<T> = { columns: TableColumn<T>[]; rows: T[]; rowKey: (row: T) => string | number; empty?: ReactNode; sortKey?: string; sortDirection?: "asc" | "desc"; onSort?: (key: string) => void };

export default function Table<T>({ columns, rows, rowKey, empty, sortKey, sortDirection, onSort }: Props<T>) {
  return <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-gray-100 bg-gray-50/80 text-xs uppercase tracking-wide text-gray-500"><tr>{columns.map((column) => <th key={column.key} className="px-5 py-3.5 font-semibold">{column.sortable ? <button type="button" onClick={() => onSort?.(column.key)} className="inline-flex items-center gap-1 hover:text-primary">{column.label}{sortKey === column.key && <span>{sortDirection === "asc" ? "↑" : "↓"}</span>}</button> : column.label}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{rows.map((row) => <tr key={rowKey(row)} className="transition hover:bg-gray-50">{columns.map((column) => <td key={column.key} className="px-5 py-4 align-middle">{column.render(row)}</td>)}</tr>)}</tbody></table>{rows.length === 0 && (empty || <EmptyState title="Aucune donnée" />)}</div>;
}

import EmptyState from "@/components/ui/EmptyState";

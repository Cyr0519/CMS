"use client";

import type { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string };

export default function Select({ label, error, className = "", id, children, ...props }: Props) {
  const selectId = id || props.name;
  return <label className="block text-sm font-medium text-primary" htmlFor={selectId}>{label && <span className="mb-1.5 block">{label}</span>}<select id={selectId} className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 ${error ? "border-danger" : "border-gray-200"} ${className}`} {...props}>{children}</select>{error && <span className="mt-1 block text-xs text-danger">{error}</span>}</label>;
}

"use client";

import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }: { message: string; type?: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const timer = window.setTimeout(onClose, 3000); return () => window.clearTimeout(timer); }, [onClose]);
  return <div role="status" className={`animate-toast-in fixed right-4 top-20 z-[80] flex max-w-sm items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg ${type === "success" ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-700"}`}><span>{type === "success" ? "✓" : "!"}</span><p className="text-sm font-medium">{message}</p><button type="button" onClick={onClose} aria-label="Fermer" className="ml-2 text-gray-400">×</button></div>;
}

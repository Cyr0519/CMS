"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

type Props = { open: boolean; title: string; onClose: () => void; children: ReactNode; maxWidth?: string };

export default function Modal({ open, title, onClose, children, maxWidth = "max-w-lg" }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, open]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className={`animate-modal-in max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white p-6 shadow-xl ${maxWidth}`}><div className="mb-5 flex items-center justify-between gap-4"><h2 id="modal-title" className="text-xl font-semibold tracking-tight text-primary">{title}</h2><button type="button" onClick={onClose} aria-label="Fermer" className="rounded-lg p-1 text-2xl text-gray-400 hover:bg-gray-100 hover:text-primary">×</button></div>{children}</div></div>;
}

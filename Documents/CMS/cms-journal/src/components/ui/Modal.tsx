"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import IconButton from "@/components/ui/IconButton";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Conservé pour compatibilité avec les appels existants. */
  maxWidth?: string;
};

export default function Modal({ open, title, description, onClose, children, footer, maxWidth = "max-w-lg" }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="animate-overlay-in fixed inset-0 z-[70] flex items-end justify-center bg-ink/25 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`animate-modal-in flex max-h-[92vh] w-full flex-col rounded-t-3xl border border-line bg-surface shadow-xl outline-none sm:rounded-3xl ${maxWidth}`}
      >
        <header className="flex items-start justify-between gap-4 px-6 pb-4 pt-5">
          <div className="min-w-0">
            <h2 id="modal-title" className="text-h2 font-semibold text-ink">{title}</h2>
            {description && <p className="mt-1 text-body text-ink-soft">{description}</p>}
          </div>
          <IconButton icon="close" label="Fermer" onClick={onClose} />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-6 py-4">{footer}</footer>}
      </div>
    </div>
  );
}

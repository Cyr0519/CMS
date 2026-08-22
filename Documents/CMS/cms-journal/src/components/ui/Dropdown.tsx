"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import Icon, { type IconName } from "@/components/ui/Icon";

type Props = {
  trigger: (open: boolean) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: "left" | "right";
  className?: string;
  menuClassName?: string;
};

export default function Dropdown({ trigger, children, align = "right", className = "", menuClassName = "w-56" }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => { if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onPointerDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="menu" className="block rounded-full">
        {trigger(open)}
      </button>
      {open && (
        <div
          role="menu"
          className={`animate-pop-in absolute z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-lg ${align === "right" ? "right-0" : "left-0"} ${menuClassName}`}
        >
          {typeof children === "function" ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  );
}

type ItemProps = { icon?: IconName; onClick?: () => void; tone?: "default" | "danger"; children: ReactNode };

export function DropdownItem({ icon, onClick, tone = "default", children }: ItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-body ${tone === "danger" ? "text-error hover:bg-error-soft" : "text-ink-soft hover:bg-gray-100 hover:text-ink"}`}
    >
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  );
}

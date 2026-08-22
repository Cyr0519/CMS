"use client";

import { useEffect } from "react";

import Icon, { type IconName } from "@/components/ui/Icon";

type Type = "success" | "error" | "info";

const tones: Record<Type, { icon: IconName; className: string }> = {
  success: { icon: "checkCircle", className: "text-success" },
  error: { icon: "alertCircle", className: "text-error" },
  info: { icon: "info", className: "text-info" },
};

/** Retour d'action discret : ancré en bas à droite, disparaît seul. */
export default function Toast({ message, type = "success", onClose }: { message: string; type?: Type; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  const tone = tones[type];
  return (
    <div role="status" className="animate-toast-in fixed bottom-5 right-5 z-[80] flex max-w-sm items-center gap-2.5 rounded-2xl border border-line bg-surface py-3 pl-4 pr-3 shadow-lg">
      <Icon name={tone.icon} size={16} className={tone.className} />
      <p className="text-body text-ink">{message}</p>
      <button type="button" onClick={onClose} aria-label="Fermer" className="ml-1 rounded-full p-1 text-ink-muted hover:bg-gray-100 hover:text-ink">
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}

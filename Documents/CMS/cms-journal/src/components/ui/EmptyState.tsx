import type { ReactNode } from "react";

import Icon, { type IconName } from "@/components/ui/Icon";

type Props = { icon?: IconName; title: string; description?: string; action?: ReactNode; compact?: boolean };

/** État vide : dire ce qui manque, et proposer l'action qui le résout. */
export default function EmptyState({ icon = "inbox", title, description, action, compact = false }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 text-center ${compact ? "py-10" : "py-16"}`}>
      <span className="flex size-11 items-center justify-center rounded-full bg-gray-100 text-ink-muted">
        <Icon name={icon} size={20} />
      </span>
      <h3 className="mt-4 text-h3 font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-body text-ink-soft">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

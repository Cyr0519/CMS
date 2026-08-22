import Link from "next/link";

import EmptyState from "@/components/ui/EmptyState";
import Icon, { type IconName } from "@/components/ui/Icon";

export type ActivityItem = { id: string; icon: IconName; tone: "brand" | "info" | "warning"; text: string; date: string; href: string };

const tones = {
  brand: "bg-brand-soft text-brand-ink",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
};

/** Journal d'activité : une ligne = un évènement daté, cliquable vers sa source. */
export default function ActivityList({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <EmptyState compact icon="clock" title="Aucune activité" description="Les évènements récents apparaîtront ici." />;
  }

  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={item.href} className="-mx-2 flex gap-3 rounded-xl px-2 py-2.5 transition hover:bg-gray-50">
            <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${tones[item.tone]}`}>
              <Icon name={item.icon} size={13} />
            </span>
            <span className="min-w-0">
              <span className="block text-body leading-snug text-ink-soft">{item.text}</span>
              <time className="mt-1 block text-caption text-ink-muted">
                {new Date(item.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </time>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

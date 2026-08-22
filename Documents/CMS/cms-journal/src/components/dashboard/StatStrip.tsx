import Icon, { type IconName } from "@/components/ui/Icon";
import Skeleton from "@/components/ui/Skeleton";

export type Stat = { label: string; value: number; hint?: string; icon: IconName };

/**
 * Vue globale : un seul panneau segmenté par des filets, plutôt que quatre
 * cartes flottantes. Les chiffres se comparent d'un coup d'œil parce qu'ils
 * partagent la même ligne de base et la même surface.
 */
export default function StatStrip({ stats, loading = false }: { stats: Stat[]; loading?: boolean }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-surface lg:grid-cols-4">
      {(loading ? Array.from({ length: 4 }, (_, index) => index) : stats).map((entry, index) => {
        const stat = typeof entry === "number" ? null : entry;
        return (
          <div key={stat?.label ?? index} className="-ml-px -mt-px border-l border-t border-line p-5">
            <div className="flex items-center gap-2 text-ink-muted">
              {stat ? <Icon name={stat.icon} size={14} /> : <Skeleton className="size-3.5" />}
              {stat ? <p className="text-label font-medium">{stat.label}</p> : <Skeleton className="h-3 w-20" />}
            </div>
            {stat ? (
              <p className="stat-value mt-3 font-display text-display font-semibold leading-none text-ink">{stat.value}</p>
            ) : (
              <Skeleton className="mt-3 h-8 w-16" />
            )}
            {stat?.hint && <p className="mt-2 text-caption text-ink-muted">{stat.hint}</p>}
          </div>
        );
      })}
    </div>
  );
}

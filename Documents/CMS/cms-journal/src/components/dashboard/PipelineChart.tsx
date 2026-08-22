import Link from "next/link";

export type PipelineSegment = { label: string; value: number; className: string; href: string };

/**
 * Analyse : répartition du flux éditorial. Une barre proportionnelle unique
 * plutôt qu'un camembert — la comparaison de quatre parts d'un même total se
 * lit mieux sur un axe qu'en secteurs, et chaque part est cliquable.
 */
export default function PipelineChart({ segments }: { segments: PipelineSegment[] }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const share = (value: number) => (total === 0 ? 0 : Math.round((value / total) * 100));

  return (
    <div>
      <div className="flex h-2.5 gap-1 overflow-hidden rounded-full bg-gray-100" role="img" aria-label={`Répartition de ${total} article(s) par statut`}>
        {segments.map((segment) => (
          segment.value > 0 && (
            <span
              key={segment.label}
              className={`animate-grow-x rounded-full ${segment.className}`}
              style={{ width: `${share(segment.value)}%` }}
            />
          )
        ))}
      </div>

      <ul className="mt-5 space-y-1">
        {segments.map((segment) => (
          <li key={segment.label}>
            <Link href={segment.href} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-gray-50">
              <span className={`size-2 shrink-0 rounded-full ${segment.className}`} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-body text-ink-soft">{segment.label}</span>
              <span className="tabular text-body font-medium text-ink">{segment.value}</span>
              <span className="tabular w-10 text-right text-caption text-ink-muted">{share(segment.value)} %</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

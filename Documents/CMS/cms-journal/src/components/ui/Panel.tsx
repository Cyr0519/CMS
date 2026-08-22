import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
  /** `flush` quand le contenu porte déjà ses propres bordures (tableau, liste). */
  flush?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Bloc de contenu titré. Sert uniquement quand le regroupement a un sens :
 * un titre, éventuellement une action, et le contenu — rien de décoratif.
 */
export default function Panel({ title, description, action, flush = false, className = "", children }: Props) {
  return (
    <section className={`rounded-2xl border border-line bg-surface ${className}`}>
      <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5">
        <div className="min-w-0">
          <h2 className="text-h3 font-semibold text-ink">{title}</h2>
          {description && <p className="mt-1 text-body-sm text-ink-muted">{description}</p>}
        </div>
        {action}
      </div>
      <div className={flush ? "" : "px-5 pb-5"}>{children}</div>
    </section>
  );
}

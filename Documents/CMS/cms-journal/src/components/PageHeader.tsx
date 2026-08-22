import type { ReactNode } from "react";

type Props = { description?: string; actions?: ReactNode; className?: string };

/**
 * Introduction de page. Le titre n'est pas répété ici : il vit dans la barre
 * supérieure, où il reste visible au défilement. Cette zone porte le contexte
 * et l'action principale.
 */
export default function PageHeader({ description, actions, className = "" }: Props) {
  if (!description && !actions) return null;
  return (
    <div className={`mb-6 flex flex-wrap items-center justify-between gap-3 ${className}`}>
      {description && <p className="max-w-2xl text-body text-ink-soft">{description}</p>}
      {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

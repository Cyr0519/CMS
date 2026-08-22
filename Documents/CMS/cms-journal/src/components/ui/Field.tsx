import type { ReactNode } from "react";

import Icon from "@/components/ui/Icon";

type Props = { id?: string; label?: string; hint?: string; error?: string; required?: boolean; className?: string; children: ReactNode };

/**
 * Enveloppe commune à tous les champs : libellé, aide, message d'erreur.
 * Garantit un espacement et une hiérarchie identiques dans tout le CMS.
 */
export default function Field({ id, label, hint, error, required, className = "", children }: Props) {
  return (
    <div className={`min-w-0 ${className}`}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-label font-medium text-ink-soft">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-caption text-ink-muted">{hint}</p>}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-caption text-error">
          <Icon name="alertCircle" size={12} strokeWidth={2} />
          {error}
        </p>
      )}
    </div>
  );
}

/** Classes partagées par input / select / textarea : un seul endroit à ajuster. */
export function controlClasses(error?: string, extra = "") {
  return `w-full rounded-xl border bg-surface text-body text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-ink-muted ${
    error ? "border-error focus:border-error focus:ring-error/15" : "border-line-strong focus:border-brand focus:ring-brand/15"
  } ${extra}`;
}

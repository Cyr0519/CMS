"use client";

import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

type Props = { title?: string; message: string; onRetry?: () => void; compact?: boolean };

/** État d'erreur : message compréhensible, et un moyen de réessayer. */
export default function ErrorState({ title = "Affichage impossible", message, onRetry, compact = false }: Props) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-error/25 bg-error-soft px-4 py-3 text-body text-error">
        <Icon name="alertCircle" size={16} />
        <p className="min-w-0">{message}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="ml-auto shrink-0 font-medium underline underline-offset-2">
            Réessayer
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface px-6 py-16 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-error-soft text-error">
        <Icon name="alert" size={20} />
      </span>
      <h3 className="mt-4 text-h3 font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-body text-ink-soft">{message}</p>
      {onRetry && (
        <Button variant="secondary" icon="refresh" className="mt-5" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}

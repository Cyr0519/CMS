import Link from "next/link";

import Icon from "@/components/ui/Icon";

/**
 * Barre de navigation en îlot flottant, détachée des bords de la page.
 * Volontairement dépourvue de lien vers l'espace de rédaction : le back-office
 * ne s'annonce pas depuis le site public, on y accède par son URL directe.
 */
export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 px-4 pt-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 rounded-full border border-line bg-surface/85 px-5 backdrop-blur">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand text-white">
            <Icon name="book" size={14} strokeWidth={2} />
          </span>
          <span className="font-display text-h3 font-semibold tracking-tight text-ink">Grace Info</span>
        </Link>
        <nav aria-label="Navigation publique" className="flex items-center gap-1 text-body font-medium">
          <Link href="/" className="rounded-full px-3 py-1.5 text-ink-soft hover:bg-gray-100 hover:text-ink">Accueil</Link>
          <Link href="/articles" className="rounded-full px-3 py-1.5 text-ink-soft hover:bg-gray-100 hover:text-ink">Articles</Link>
        </nav>
      </div>
    </header>
  );
}

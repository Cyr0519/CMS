"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Dropdown from "@/components/ui/Dropdown";
import Icon from "@/components/ui/Icon";
import { pageMeta } from "@/lib/navigation";
import { useCurrentUser } from "@/lib/use-current-user";

type Props = { onMenuToggle: () => void };

/**
 * Barre supérieure volontairement légère : repère de navigation (fil d'Ariane +
 * titre), recherche, et la seule notification réellement actionnable du CMS —
 * les articles en attente de validation. Le profil vit dans la sidebar.
 */
export default function Header({ onMenuToggle }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();
  const [pending, setPending] = useState(0);
  const [search, setSearch] = useState("");

  const canReview = user?.role === "editeur" || user?.role === "administrateur";
  const meta = pageMeta(pathname);

  useEffect(() => {
    if (!canReview) return;
    void fetch("/api/articles?page=1&limit=1&statut=EN_ATTENTE", { cache: "no-store" })
      .then(async (response) => {
        const result = (await response.json()) as { pagination?: { total: number }; data?: { pagination?: { total: number } } };
        setPending(result.pagination?.total ?? result.data?.pagination?.total ?? 0);
      })
      .catch(() => setPending(0));
  }, [canReview]);

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-1 flex h-16 items-center gap-3 bg-canvas/85 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <button
        type="button"
        onClick={onMenuToggle}
        aria-label="Ouvrir le menu"
        className="-ml-1 rounded-full p-2 text-ink-soft hover:bg-gray-100 hover:text-ink lg:hidden"
      >
        <Icon name="menu" size={18} />
      </button>

      <div className="min-w-0">
        {meta.parent && (
          <nav aria-label="Fil d’Ariane" className="flex items-center gap-1 text-caption text-ink-muted">
            <Link href={meta.parent.href} className="hover:text-ink-soft">{meta.parent.label}</Link>
            <Icon name="chevronRight" size={11} />
            <span className="truncate">{meta.title}</span>
          </nav>
        )}
        <h1 className="truncate text-h2 font-semibold text-ink">{meta.title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <form
          role="search"
          className="hidden md:block"
          onSubmit={(event) => {
            event.preventDefault();
            router.push(`/dashboard/articles?search=${encodeURIComponent(search)}`);
          }}
        >
          <label className="relative block">
            <span className="sr-only">Rechercher un article</span>
            <Icon name="search" size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher…"
              className="h-9 w-56 rounded-full border border-line bg-surface pl-9 pr-4 text-body text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 lg:w-64"
            />
          </label>
        </form>

        {canReview && (
          <Dropdown
            menuClassName="w-72"
            trigger={() => (
              <span className="relative flex size-9 items-center justify-center rounded-full border border-line bg-surface text-ink-soft transition hover:text-ink">
                <Icon name="bell" size={16} />
                {pending > 0 && (
                  <span className="tabular absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-none text-white">
                    {pending > 9 ? "9+" : pending}
                  </span>
                )}
                <span className="sr-only">{pending} article(s) en attente</span>
              </span>
            )}
          >
            {(close) => (
              <div className="p-1">
                <p className="px-3 py-2 text-caption font-medium uppercase tracking-[.1em] text-ink-muted">Validation</p>
                {pending > 0 ? (
                  <Link
                    href="/dashboard/articles?status=EN_ATTENTE"
                    onClick={close}
                    className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 hover:bg-gray-100"
                  >
                    <Icon name="clock" size={16} className="mt-0.5 text-warning" />
                    <span className="text-body text-ink-soft">
                      <span className="font-medium text-ink">{pending} article{pending > 1 ? "s" : ""}</span> en attente de votre validation.
                    </span>
                  </Link>
                ) : (
                  <p className="px-3 py-2.5 text-body text-ink-muted">Aucun article en attente.</p>
                )}
              </div>
            )}
          </Dropdown>
        )}
      </div>
    </header>
  );
}

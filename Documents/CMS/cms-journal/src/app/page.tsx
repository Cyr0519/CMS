"use client";

import { useEffect, useState } from "react";

import PublicArticleCard, { type PublicArticle } from "@/components/PublicArticleCard";
import PublicHeader from "@/components/PublicHeader";
import ButtonLink from "@/components/ui/ButtonLink";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";

export default function HomePage() {
  const [articles, setArticles] = useState<PublicArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/public/articles?page=1&limit=6", { cache: "no-store" })
      .then(async (response) => {
        const result = (await response.json()) as { data?: PublicArticle[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Impossible de charger les articles");
        setArticles(result.data || []);
      })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Une erreur est survenue"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-canvas">
      <PublicHeader />

      {/* Ouverture : une bande teintée aux angles largement arrondis, pas une image plein écran */}
      <section className="px-4 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl bg-surface-soft px-6 py-16 sm:px-12 sm:py-24">
          <p className="text-label font-medium uppercase tracking-[.16em] text-brand">L’information avec grâce</p>
          <h1 className="mt-4 max-w-2xl font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-ink sm:text-[3rem]">
            Actualités, analyses et récits pour comprendre le monde.
          </h1>
          <p className="mt-5 max-w-xl text-body leading-relaxed text-ink-soft sm:text-[.9375rem]">
            La rédaction de Grace Info publie chaque semaine des enquêtes et des reportages sur les sujets qui façonnent notre quotidien.
          </p>
          <ButtonLink href="/articles" size="lg" iconRight="arrowUpRight" className="mt-8">
            Parcourir les articles
          </ButtonLink>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-label font-medium uppercase tracking-[.16em] text-brand">À la une</p>
            <h2 className="mt-2 font-display text-h1 font-semibold tracking-tight text-ink">Derniers articles publiés</h2>
          </div>
          <ButtonLink href="/articles" variant="secondary" size="sm" iconRight="chevronRight">Tout voir</ButtonLink>
        </div>

        {error && <ErrorState message={error} />}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => <Skeleton key={item} className="h-[380px] rounded-3xl" />)}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => <PublicArticleCard key={article.id} article={article} />)}
          </div>
        ) : (
          !error && (
            <div className="rounded-3xl border border-line bg-surface">
              <EmptyState icon="article" title="Aucun article publié" description="Les prochaines publications apparaîtront ici." />
            </div>
          )
        )}
      </main>

      <footer className="border-t border-line px-4 py-8 text-center text-body-sm text-ink-muted sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Grace Info
      </footer>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

import PublicArticleCard, { type PublicArticle } from "@/components/PublicArticleCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Pagination from "@/components/ui/Pagination";
import Skeleton from "@/components/ui/Skeleton";

type PageInfo = { page: number; limit: number; total: number; totalPages: number };

export default function PublicArticlesPage() {
  const [articles, setArticles] = useState<PublicArticle[]>([]);
  const [pagination, setPagination] = useState<PageInfo>({ page: 1, limit: 9, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.resolve().then(() => {
      setLoading(true); setError("");
      return fetch(`/api/public/articles?page=${page}&limit=9`, { cache: "no-store" })
        .then(async (response) => {
          const result = (await response.json()) as { data?: PublicArticle[]; pagination?: PageInfo; error?: string };
          if (!response.ok) throw new Error(result.error || "Impossible de charger les articles");
          setArticles(result.data || []);
          setPagination(result.pagination || { page, limit: 9, total: 0, totalPages: 0 });
          window.scrollTo({ top: 0, behavior: "smooth" });
        })
        .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Une erreur est survenue"))
        .finally(() => setLoading(false));
    });
  }, [page]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="text-label font-medium uppercase tracking-[.16em] text-brand">Grace Info</p>
        <h1 className="mt-2 font-display text-[1.75rem] font-semibold tracking-tight text-ink sm:text-[2.25rem]">Tous les articles</h1>
        <p className="mt-3 max-w-2xl text-body leading-relaxed text-ink-soft">
          Retrouvez les dernières actualités, analyses et histoires publiées par notre rédaction.
        </p>
      </header>

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
            <EmptyState icon="article" title="Aucun article" description="Aucune publication n’est disponible pour le moment." />
          </div>
        )
      )}

      {!loading && articles.length > 0 && (
        <div className="mt-10">
          <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} unit="article" onChange={setPage} />
        </div>
      )}
    </div>
  );
}

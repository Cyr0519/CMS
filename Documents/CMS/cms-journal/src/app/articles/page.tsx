"use client";

import { useEffect, useState } from "react";

import PublicArticleCard, { type PublicArticle } from "@/components/PublicArticleCard";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

type Pagination = { page: number; limit: number; total: number; totalPages: number };

export default function PublicArticlesPage() {
  const [articles, setArticles] = useState<PublicArticle[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 9, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.resolve().then(() => {
      setLoading(true); setError("");
      return fetch(`/api/public/articles?page=${page}&limit=9`, { cache: "no-store" }).then(async (response) => {
        const result = (await response.json()) as { data?: PublicArticle[]; pagination?: Pagination; error?: string };
        if (!response.ok) throw new Error(result.error || "Impossible de charger les articles");
        setArticles(result.data || []);
        setPagination(result.pagination || { page, limit: 9, total: 0, totalPages: 0 });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Une erreur est survenue"))
        .finally(() => setLoading(false));
    });
  }, [page]);

  return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div className="mb-10"><p className="text-sm font-semibold uppercase tracking-wider text-accent">Grace Info</p><h1 className="mt-2 text-4xl font-semibold tracking-tight text-primary">Tous les articles</h1><p className="mt-3 max-w-2xl text-gray-500">Retrouvez les dernières actualités, analyses et histoires publiées par notre rédaction.</p></div>
    {error && <p className="rounded-xl bg-red-50 p-4 text-danger">{error}</p>}
    {loading ? <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map((item) => <Skeleton key={item} className="h-96" />)}</div> : articles.length > 0 ? <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{articles.map((article) => <PublicArticleCard key={article.id} article={article} />)}</div> : <div className="rounded-xl bg-white"><EmptyState icon="📰" title="Aucun article" /></div>}
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-gray-500">{pagination.total} article(s)</p><div className="flex items-center gap-2"><Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Précédent</Button><span className="px-3 text-sm text-gray-500">Page {pagination.page} sur {Math.max(1, pagination.totalPages)}</span><Button variant="outline" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Suivant</Button></div></div>
  </div>;
}

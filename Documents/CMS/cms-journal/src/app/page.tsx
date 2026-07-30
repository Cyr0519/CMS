"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import PublicArticleCard, { type PublicArticle } from "@/components/PublicArticleCard";
import PublicHeader from "@/components/PublicHeader";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

export default function HomePage() {
  const [articles, setArticles] = useState<PublicArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/public/articles?page=1&limit=6", { cache: "no-store" }).then(async (response) => {
      const result = (await response.json()) as { data?: PublicArticle[]; error?: string };
      if (!response.ok) throw new Error(result.error || "Impossible de charger les articles");
      setArticles(result.data || []);
    }).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Une erreur est survenue"))
      .finally(() => setLoading(false));
  }, []);

  return <div className="min-h-screen bg-[#f5f5f7]">
    <PublicHeader />
    <section className="bg-primary px-4 py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl"><p className="font-semibold uppercase tracking-[.2em] text-accent">L’information avec grâce</p><h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Grace Info</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-300">Actualités, analyses et récits pour mieux comprendre le monde qui nous entoure.</p><Link href="/articles" className="mt-8 inline-flex rounded-lg bg-accent px-5 py-3 font-medium text-white hover:bg-[#d63852] active:scale-95">Voir tous les articles</Link></div>
    </section>
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wider text-accent">À la une</p><h2 className="mt-1 text-3xl font-semibold tracking-tight text-primary">Derniers articles publiés</h2></div><Link href="/articles" className="hidden text-sm font-medium text-accent hover:underline sm:block">Voir tous →</Link></div>{error && <p className="rounded-xl bg-red-50 p-4 text-danger">{error}</p>}{loading ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map((item) => <Skeleton key={item} className="h-96" />)}</div> : articles.length > 0 ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{articles.map((article) => <PublicArticleCard key={article.id} article={article} />)}</div> : <div className="rounded-xl bg-white"><EmptyState icon="📰" title="Aucun article publié" description="Les prochains articles apparaîtront bientôt ici." /></div>}</main>
    <footer className="bg-primary px-4 py-8 text-center text-sm text-gray-400">© {new Date().getFullYear()} Grace Info</footer>
  </div>;
}

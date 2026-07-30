"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ArticleEditor, { type Category, type EditorUser } from "@/components/ArticleEditor";
import Skeleton from "@/components/ui/Skeleton";

export default function NewArticlePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<EditorUser | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    void fetch("/api/articles?limit=1", { cache: "no-store" }).then(async (response) => {
      const result = (await response.json()) as { categories?: Category[]; currentUser?: EditorUser; data?: { categories?: Category[]; currentUser?: EditorUser }; error?: string };
      if (!response.ok) throw new Error(result.error || "Chargement impossible");
      setCategories(result.categories || result.data?.categories || []); setCurrentUser(result.currentUser || result.data?.currentUser || null);
    }).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Une erreur est survenue"));
  }, []);
  return <div className="space-y-6"><div><Link href="/dashboard/articles" className="text-sm font-medium text-accent hover:underline">← Retour aux articles</Link><h2 className="mt-3 text-3xl font-semibold tracking-tight">Nouvel article</h2></div>{error && <p className="rounded-xl bg-red-50 p-4 text-danger">{error}</p>}{currentUser ? <ArticleEditor categories={categories} currentUser={currentUser} /> : <Skeleton className="h-[700px]" />}</div>;
}

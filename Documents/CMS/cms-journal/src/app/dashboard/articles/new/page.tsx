"use client";

import { useEffect, useState } from "react";

import ArticleEditor, { type Category, type EditorUser } from "@/components/ArticleEditor";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";

export default function NewArticlePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<EditorUser | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/articles?limit=1", { cache: "no-store" })
      .then(async (response) => {
        const result = (await response.json()) as { categories?: Category[]; currentUser?: EditorUser; data?: { categories?: Category[]; currentUser?: EditorUser }; error?: string };
        if (!response.ok) throw new Error(result.error || "Chargement impossible");
        setCategories(result.categories || result.data?.categories || []);
        setCurrentUser(result.currentUser || result.data?.currentUser || null);
      })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Une erreur est survenue"));
  }, []);

  if (error) return <ErrorState message={error} />;

  if (!currentUser) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[520px] lg:col-span-2" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return <ArticleEditor categories={categories} currentUser={currentUser} />;
}

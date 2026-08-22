"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import ArticleComments from "@/components/ArticleComments";
import ArticleEditor, { type Category, type EditorArticle, type EditorUser } from "@/components/ArticleEditor";
import ArticleReviewActions from "@/components/ArticleReviewActions";
import EditorNotes from "@/components/EditorNotes";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";

type DetailArticle = EditorArticle & {
  publishedAt: string | null;
  user: { id: number; nom: string; prenom: string; email: string; photo?: string | null };
  category: { id: number; nom: string };
};
type DetailData = { article: DetailArticle; categories: Category[]; currentUser: EditorUser; error?: string };

const labels: Record<string, string> = { BROUILLON: "Brouillon", EN_ATTENTE: "En attente", PUBLIE: "Publié", REFUSE: "Refusé", ARCHIVE: "Archivé" };
const statusVariant = (status: string) => (status === "PUBLIE" ? "success" : status === "EN_ATTENTE" ? "warning" : status === "REFUSE" ? "danger" : "default");

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<DetailData | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/articles/${id}`, { cache: "no-store" });
      const result = (await response.json()) as DetailData;
      if (!response.ok) throw new Error(result.error || "Chargement impossible");
      setData(result);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Une erreur est survenue"); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      setEditing(new URLSearchParams(window.location.search).get("edit") === "1");
      return load();
    });
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-[280px] w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return <ErrorState message={error} onRetry={() => void load()} />;

  const { article, currentUser, categories } = data;
  const canEdit = article.statut !== "PUBLIE" && (article.userId === currentUser.id || currentUser.role === "administrateur");

  if (editing && canEdit) {
    return <ArticleEditor article={article} categories={categories} currentUser={currentUser} onRefresh={load} onCancel={() => setEditing(false)} />;
  }

  const cover = article.images.find((image) => image.imageCouverture) || article.images[0];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant(article.statut)} dot>{labels[article.statut]}</Badge>
          <Badge variant="brand">{article.category.nom}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink href="/dashboard/articles" variant="ghost" icon="arrowLeft" size="sm">Retour</ButtonLink>
          {canEdit && <Button variant="secondary" icon="edit" size="sm" onClick={() => setEditing(true)}>Modifier</Button>}
          {/* Publier / refuser / dépublier : réservé aux éditeurs et administrateurs. */}
          <ArticleReviewActions articleId={article.id} statut={article.statut} role={currentUser.role} onDone={load} />
        </div>
      </div>

      <h2 className="font-display text-h1 font-semibold tracking-tight text-ink sm:text-[1.75rem] sm:leading-tight">{article.titre}</h2>

      <div className="mt-4 flex flex-wrap items-center gap-2.5 text-body-sm text-ink-muted">
        <Avatar nom={article.user.nom} prenom={article.user.prenom} src={article.user.photo} size={32} />
        <span className="font-medium text-ink-soft">{article.user.prenom} {article.user.nom}</span>
        <span aria-hidden="true">·</span>
        <time>{new Date(article.publishedAt || article.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</time>
      </div>

      {cover && (
        <div className="relative mt-6 h-[220px] w-full overflow-hidden rounded-2xl bg-gray-100 sm:h-[340px]">
          <Image src={cover.chemin} alt={cover.nomFichier} fill priority sizes="(max-width: 896px) 100vw, 896px" className="object-cover" />
        </div>
      )}

      <article className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-8">
        {article.resume && (
          <p className="border-l-2 border-brand pl-4 text-h3 leading-relaxed text-ink-soft">{article.resume}</p>
        )}
        <div className="mt-6 whitespace-pre-wrap text-body leading-7 text-ink-soft sm:text-[.9375rem]">{article.contenu}</div>
        <ArticleComments articleId={article.id} />
      </article>

      <div className="mt-6">
        <EditorNotes articleId={article.id} currentUser={currentUser} />
      </div>
    </div>
  );
}

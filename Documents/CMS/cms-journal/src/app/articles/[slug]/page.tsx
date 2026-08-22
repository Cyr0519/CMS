"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import LikeButton from "@/components/LikeButton";
import type { PublicArticle } from "@/components/PublicArticleCard";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";
import Textarea from "@/components/ui/Textarea";
import Toast from "@/components/ui/Toast";

type Comment = { id: number; nomAuteur: string; contenu: string; createdAt: string };
type ArticleDetail = PublicArticle & { createdAt: string; comments: Comment[] };

export default function PublicArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [contenu, setContenu] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/public/articles/${encodeURIComponent(slug)}`, { cache: "no-store" });
      const result = (await response.json()) as { data?: ArticleDetail; error?: string };
      if (!response.ok || !result.data) throw new Error(result.error || "Article introuvable");
      setArticle(result.data);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Une erreur est survenue"); }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (nom.trim().length < 2) { setError("Le nom doit contenir au moins 2 caractères."); return; }
    if (!contenu.trim()) { setError("Le commentaire est obligatoire."); return; }
    setSubmitting(true);
    try {
      const response = await fetch(`/api/public/articles/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom_auteur: nom.trim(), email: email.trim() || undefined, contenu: contenu.trim() }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Impossible d’ajouter le commentaire");
      setNom(""); setEmail(""); setContenu(""); setToast("Commentaire publié"); await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Une erreur est survenue"); }
    finally { setSubmitting(false); }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-11 w-3/4" />
        <Skeleton className="h-[320px] rounded-3xl" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <ErrorState title="Article introuvable" message={error || "Cet article n’existe pas ou n’est plus publié."} onRetry={() => void load()} />
        <div className="mt-6 flex justify-center">
          <ButtonLink href="/articles" variant="secondary" icon="arrowLeft">Tous les articles</ButtonLink>
        </div>
      </div>
    );
  }

  const cover = article.images.find((image) => image.imageCouverture) || article.images[0];

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/articles" className="inline-flex items-center gap-1.5 text-body-sm font-medium text-ink-muted hover:text-ink">
        <Icon name="arrowLeft" size={13} />
        Tous les articles
      </Link>

      <header className="mt-6">
        <Badge variant="brand">{article.category.nom}</Badge>
        <h1 className="mt-4 font-display text-[1.75rem] font-semibold leading-tight tracking-tight text-ink sm:text-[2.5rem]">
          {article.titre}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-2.5 text-body-sm text-ink-muted">
          <Avatar nom={article.author.nom} prenom={article.author.prenom} size={32} />
          <span className="font-medium text-ink-soft">{article.author.prenom} {article.author.nom}</span>
          <span aria-hidden="true">·</span>
          <time>{new Date(article.publishedAt || article.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</time>
        </div>
      </header>

      {cover && (
        <div className="relative mt-8 h-[240px] w-full overflow-hidden rounded-3xl bg-gray-100 sm:h-[400px]">
          <Image src={cover.chemin} alt={cover.nomFichier || article.titre} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
        </div>
      )}

      {article.resume && (
        <p className="mt-8 border-l-2 border-brand pl-5 text-h2 leading-relaxed text-ink-soft">{article.resume}</p>
      )}

      <div className="mt-8 whitespace-pre-wrap text-[.9375rem] leading-8 text-ink-soft">{article.contenu}</div>

      <div className="mt-8 flex items-center gap-3 border-t border-line pt-6">
        <LikeButton slug={article.slug} initialLikes={article.likes ?? 0} />
        <span className="text-body-sm text-ink-muted">Cet article vous a plu ?</span>
      </div>

      <section className="mt-12 border-t border-line pt-10">
        <h2 className="flex items-center gap-2 font-display text-h1 font-semibold tracking-tight text-ink">
          Commentaires
          <span className="tabular rounded-full bg-gray-100 px-2.5 py-1 text-label font-medium text-ink-soft">{article.comments.length}</span>
        </h2>

        <form onSubmit={(event) => void submitComment(event)} className="mt-6 rounded-3xl border border-line bg-surface p-5 sm:p-6">
          <h3 className="text-h3 font-semibold text-ink">Laisser un commentaire</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Nom" required minLength={2} value={nom} onChange={(event) => setNom(event.target.value)} />
            <Input label="Email" type="email" hint="Facultatif, jamais publié." value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="mt-4">
            <Textarea label="Commentaire" required rows={4} maxLength={2000} counter value={contenu} onChange={(event) => setContenu(event.target.value)} />
          </div>
          {error && <p className="mt-3 text-body-sm text-error">{error}</p>}
          <div className="mt-4 flex justify-end">
            <Button type="submit" icon="send" loading={submitting}>Publier</Button>
          </div>
        </form>

        {article.comments.length === 0 ? (
          <EmptyState compact icon="comment" title="Aucun commentaire" description="Soyez le premier à réagir à cet article." />
        ) : (
          <ul className="mt-6 space-y-3">
            {article.comments.map((comment) => (
              <li key={comment.id} className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
                <Avatar nom={comment.nomAuteur} size={34} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-medium text-ink">{comment.nomAuteur}</p>
                    <time className="text-caption text-ink-muted">{new Date(comment.createdAt).toLocaleDateString("fr-FR")}</time>
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-body leading-relaxed text-ink-soft">{comment.contenu}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </article>
  );
}

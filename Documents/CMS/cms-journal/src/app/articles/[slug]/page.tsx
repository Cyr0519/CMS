"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import type { PublicArticle } from "@/components/PublicArticleCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";
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

  if (loading) return <div className="mx-auto max-w-5xl space-y-6 px-4 py-12"><Skeleton className="h-12 w-3/4" /><Skeleton className="h-[400px]" /><Skeleton className="h-72" /></div>;
  if (!article) return <div className="mx-auto max-w-3xl px-4 py-20 text-center"><p className="rounded-xl bg-red-50 p-4 text-danger">{error || "Article introuvable"}</p><Link href="/articles" className="mt-6 inline-block font-medium text-accent hover:underline">Retour aux articles</Link></div>;

  const cover = article.images.find((image) => image.imageCouverture) || article.images[0];
  return <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <Link href="/articles" className="text-sm font-medium text-accent hover:underline">← Tous les articles</Link>
    <div className="mt-6 flex flex-wrap items-center gap-3"><Badge variant="info">{article.category.nom}</Badge><span className="text-sm text-gray-500">{article.author.prenom} {article.author.nom}</span><span className="text-gray-300">·</span><time className="text-sm text-gray-500">{new Date(article.publishedAt || article.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</time></div>
    <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-5xl">{article.titre}</h1>
    {cover && <div className="relative mt-8 h-[260px] w-full overflow-hidden rounded-xl shadow-md sm:h-[400px]"><Image src={cover.chemin} alt={cover.nomFichier || article.titre} fill priority className="object-cover" /></div>}
    <Card className="mt-8 hover:translate-y-0"><p className="border-l-4 border-accent py-2 pl-4 text-lg italic leading-relaxed text-gray-600">{article.resume}</p><div className="mt-8 whitespace-pre-wrap text-base leading-8 text-gray-800">{article.contenu}</div></Card>
    <section className="mt-10"><div className="mb-5 flex items-center gap-3"><h2 className="text-2xl font-semibold tracking-tight text-primary">Commentaires</h2><Badge variant="info">{article.comments.length}</Badge></div><Card className="hover:translate-y-0"><h3 className="mb-5 text-lg font-semibold">Laisser un commentaire</h3><form onSubmit={(event) => void submitComment(event)} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Input label="Nom *" value={nom} onChange={(event) => setNom(event.target.value)} required minLength={2} /><Input label="Email (optionnel)" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div><label className="block text-sm font-medium text-primary">Commentaire *<textarea value={contenu} onChange={(event) => setContenu(event.target.value)} required maxLength={2000} rows={5} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" /></label>{error && <p className="text-sm text-danger">{error}</p>}<Button type="submit" loading={submitting}>Publier le commentaire</Button></form></Card><div className="mt-6 space-y-4">{article.comments.map((comment) => <Card key={comment.id} className="p-5 hover:translate-y-0"><div className="flex items-center justify-between gap-4"><p className="font-semibold text-primary">{comment.nomAuteur}</p><time className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString("fr-FR")}</time></div><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{comment.contenu}</p></Card>)}{article.comments.length === 0 && <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500">Soyez le premier à commenter cet article.</p>}</div></section>
    {toast && <Toast message={toast} onClose={() => setToast("")} />}
  </article>;
}

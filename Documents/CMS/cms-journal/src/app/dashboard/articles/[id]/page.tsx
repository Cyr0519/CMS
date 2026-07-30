"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import ArticleComments from "@/components/ArticleComments";
import ArticleEditor, { type Category, type EditorArticle, type EditorUser } from "@/components/ArticleEditor";
import EditorNotes from "@/components/EditorNotes";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";

type DetailArticle = EditorArticle & {
  publishedAt: string | null;
  user: { id: number; nom: string; prenom: string; email: string; photo?: string | null };
  category: { id: number; nom: string };
};
type DetailData = { article: DetailArticle; categories: Category[]; currentUser: EditorUser; error?: string };
const labels: Record<string, string> = { BROUILLON: "Brouillon", EN_ATTENTE: "En attente", PUBLIE: "Publié", REFUSE: "Refusé", ARCHIVE: "Archivé" };
const statusVariant = (status: string) => status === "PUBLIE" ? "success" : status === "EN_ATTENTE" ? "warning" : status === "REFUSE" ? "danger" : "default";

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
  if (loading) return <div className="space-y-6"><Skeleton className="h-12 w-2/3" /><Skeleton className="h-[420px]" /><Skeleton className="h-64" /></div>;
  if (!data) return <Card><p className="text-danger">{error}</p></Card>;

  const { article, currentUser, categories } = data;
  const canEdit = article.statut !== "PUBLIE" && (article.userId === currentUser.id || currentUser.role === "administrateur");
  if (editing && canEdit) return <div className="space-y-6"><div className="flex items-center justify-between"><div><Link href="/dashboard/articles" className="text-sm font-medium text-accent hover:underline">← Retour aux articles</Link><h2 className="mt-2 text-3xl font-semibold tracking-tight">Modifier l’article</h2></div></div><ArticleEditor article={article} categories={categories} currentUser={currentUser} onRefresh={load} onCancel={() => setEditing(false)} /></div>;

  const cover = article.images.find((image) => image.imageCouverture) || article.images[0];
  return <div className="mx-auto max-w-5xl">
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><Link href="/dashboard/articles" className="text-sm font-medium text-accent hover:underline">← Retour aux articles</Link><div className="mt-4 flex flex-wrap items-center gap-2"><Badge variant={statusVariant(article.statut)}>{labels[article.statut]}</Badge><Badge variant="info">{article.category.nom}</Badge></div><h2 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight text-primary sm:text-4xl">{article.titre}</h2></div>{canEdit && <Button variant="outline" onClick={() => setEditing(true)}>✏️ Modifier</Button>}</div>
    <div className="mb-7 flex flex-wrap items-center gap-3 text-sm text-gray-500"><Avatar nom={article.user.nom} prenom={article.user.prenom} src={article.user.photo} size={40} /><span className="font-medium text-primary">{article.user.prenom} {article.user.nom}</span><span>·</span><time>{new Date(article.publishedAt || article.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</time><span>·</span><span>{article.category.nom}</span></div>
    {cover && <div className="relative mb-8 h-[260px] w-full overflow-hidden rounded-xl shadow-md sm:h-[400px]"><Image src={cover.chemin} alt={cover.nomFichier} fill priority className="object-cover" /></div>}
    <Card className="hover:translate-y-0"><p className="border-l-4 border-accent py-2 pl-4 text-lg italic leading-relaxed text-gray-600">{article.resume || "Aucun résumé."}</p><article className="mt-8 whitespace-pre-wrap text-base leading-8 text-gray-800">{article.contenu}</article><EditorNotes articleId={article.id} currentUser={currentUser} /><ArticleComments articleId={article.id} /></Card>
  </div>;
}

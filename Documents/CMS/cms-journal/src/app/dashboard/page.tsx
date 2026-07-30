"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import StatsCard from "@/components/StatsCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import Table, { type TableColumn } from "@/components/ui/Table";

type Article = { id: number; titre: string; statut: string; createdAt: string; userId: number; user: { nom: string; prenom: string }; category: { nom: string } };
type Comment = { id: number; nomAuteur: string; contenu: string; createdAt: string; article: { id: number; titre: string } };
type Data = {
  stats: { articles: { BROUILLON: number; EN_ATTENTE: number; PUBLIE: number; REFUSE: number }; totalComments: number; journalistCount: number };
  latestArticles: Article[];
  latestArticlesPagination: { page: number; total: number; totalPages: number };
  pendingArticles: Article[];
  latestComments: Comment[];
};

const statusVariant = (status: string) => status === "PUBLIE" ? "success" : status === "EN_ATTENTE" ? "warning" : status === "REFUSE" ? "danger" : "default";
const statusLabel: Record<string, string> = { BROUILLON: "Brouillon", EN_ATTENTE: "En attente", PUBLIE: "Publié", REFUSE: "Refusé" };

export default function DashboardPage() {
  const [data, setData] = useState<Data | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch(`/api/dashboard?page=${page}`, { cache: "no-store" }).then(async (response) => {
      const result = (await response.json()) as { data?: Data; error?: string };
      if (!response.ok || !result.data) throw new Error(result.error || "Chargement impossible");
      setData(result.data);
    }).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Une erreur est survenue"));
  }, [page]);

  const columns: TableColumn<Article>[] = [
    { key: "titre", label: "Titre", render: (article) => <p className="max-w-64 truncate font-medium text-primary">{article.titre}</p> },
    { key: "auteur", label: "Auteur", render: (article) => <span className="text-gray-600">{article.user.prenom} {article.user.nom}</span> },
    { key: "categorie", label: "Catégorie", render: (article) => <Badge variant="info">{article.category.nom}</Badge> },
    { key: "statut", label: "Statut", render: (article) => <Badge variant={statusVariant(article.statut)}>{statusLabel[article.statut]}</Badge> },
    { key: "date", label: "Date", render: (article) => <span className="text-gray-500">{new Date(article.createdAt).toLocaleDateString("fr-FR")}</span> },
    { key: "actions", label: "Actions", render: (article) => <div className="flex gap-1"><Link href={`/dashboard/articles/${article.id}`} aria-label={`Voir ${article.titre}`} className="rounded-lg p-2 hover:bg-gray-100">👁️</Link><Link href={`/dashboard/articles/${article.id}?edit=1`} aria-label={`Modifier ${article.titre}`} className="rounded-lg p-2 hover:bg-gray-100">✏️</Link></div> },
  ];

  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  if (error) return <Card><p className="text-danger">{error}</p></Card>;
  if (!data) return <div className="space-y-6"><Skeleton className="h-14 w-72" /><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map((item) => <Skeleton key={item} className="h-36" />)}</div><Skeleton className="h-96" /></div>;

  const activity = [
    ...data.pendingArticles.map((article) => ({ id: `a-${article.id}`, type: "article", date: article.createdAt, text: `« ${article.titre} » attend une validation`, href: `/dashboard/articles/${article.id}` })),
    ...data.latestComments.map((comment) => ({ id: `c-${comment.id}`, type: "comment", date: comment.createdAt, text: `${comment.nomAuteur} a commenté « ${comment.article.titre} »`, href: `/dashboard/articles/${comment.article.id}` })),
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 7);

  return <div className="space-y-8">
    <div><h2 className="text-3xl font-semibold tracking-tight text-primary">Tableau de bord</h2><p className="mt-1 capitalize text-gray-500">{today}</p></div>
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"><StatsCard titre="Articles publiés" valeur={data.stats.articles.PUBLIE} icone="📝" couleur="#e94560" /><StatsCard titre="En attente" valeur={data.stats.articles.EN_ATTENTE} icone="⏳" couleur="#f59e0b" /><StatsCard titre="Commentaires" valeur={data.stats.totalComments} icone="💬" couleur="#1a1a2e" /><StatsCard titre="Journalistes" valeur={data.stats.journalistCount} icone="👥" couleur="#10b981" /></section>
    <div className="grid items-start gap-8 xl:grid-cols-3">
      <section className="xl:col-span-2"><div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-semibold tracking-tight">Articles récents</h3><Link href="/dashboard/articles" className="text-sm font-medium text-accent hover:underline">Voir tous</Link></div><Table columns={columns} rows={data.latestArticles} rowKey={(article) => article.id} empty={<EmptyState icon="📰" title="Aucun article" />} /><div className="mt-4 flex items-center justify-between"><p className="text-sm text-gray-500">{data.latestArticlesPagination.total} article(s)</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Précédent</Button><span className="px-2 py-1.5 text-sm text-gray-500">{page} / {Math.max(1, data.latestArticlesPagination.totalPages)}</span><Button variant="outline" size="sm" disabled={page >= data.latestArticlesPagination.totalPages} onClick={() => setPage((value) => value + 1)}>Suivant</Button></div></div></section>
      <Card className="sticky top-24 hover:translate-y-0"><h3 className="mb-5 text-xl font-semibold tracking-tight">Activité récente</h3><div className="relative space-y-6 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-gray-200">{activity.map((item) => <Link key={item.id} href={item.href} className="relative flex gap-4"><span className={`relative z-10 mt-1 size-[15px] shrink-0 rounded-full border-4 border-white ${item.type === "article" ? "bg-accent" : "bg-primary"}`} /><span><span className="block text-sm leading-relaxed text-gray-700">{item.text}</span><span className="mt-1 block text-xs text-gray-400">{new Date(item.date).toLocaleDateString("fr-FR")}</span></span></Link>)}{activity.length === 0 && <p className="text-sm text-gray-500">Aucune activité récente.</p>}</div></Card>
    </div>
  </div>;
}

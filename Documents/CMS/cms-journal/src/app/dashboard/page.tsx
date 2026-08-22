"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import ActivityList, { type ActivityItem } from "@/components/dashboard/ActivityList";
import PipelineChart from "@/components/dashboard/PipelineChart";
import StatStrip from "@/components/dashboard/StatStrip";
import Badge from "@/components/ui/Badge";
import ButtonLink from "@/components/ui/ButtonLink";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Icon from "@/components/ui/Icon";
import Pagination from "@/components/ui/Pagination";
import Panel from "@/components/ui/Panel";
import Skeleton from "@/components/ui/Skeleton";
import Table, { type TableColumn } from "@/components/ui/Table";
import { useCurrentUser } from "@/lib/use-current-user";

type Article = { id: number; titre: string; statut: string; createdAt: string; updatedAt: string; userId: number; user: { nom: string; prenom: string }; category?: { nom: string } };
type Comment = { id: number; nomAuteur: string; contenu: string; createdAt: string; article: { id: number; titre: string } };
type Data = {
  stats: { articles: { BROUILLON: number; EN_ATTENTE: number; PUBLIE: number; REFUSE: number }; totalComments: number; journalistCount: number };
  latestArticles: Article[];
  latestArticlesPagination: { page: number; total: number; totalPages: number };
  pendingArticles: Article[];
  latestComments: Comment[];
};

const statusVariant = (status: string) => (status === "PUBLIE" ? "success" : status === "EN_ATTENTE" ? "warning" : status === "REFUSE" ? "danger" : "default");
const statusLabel: Record<string, string> = { BROUILLON: "Brouillon", EN_ATTENTE: "En attente", PUBLIE: "Publié", REFUSE: "Refusé", ARCHIVE: "Archivé" };

export default function DashboardPage() {
  const user = useCurrentUser();
  const [data, setData] = useState<Data | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch(`/api/dashboard?page=${page}`, { cache: "no-store" });
      const result = (await response.json()) as { data?: Data; error?: string };
      if (!response.ok || !result.data) throw new Error(result.error || "Chargement impossible");
      setData(result.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Une erreur est survenue");
    }
  }, [page]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const canReview = user?.role === "editeur" || user?.role === "administrateur";

  const columns: TableColumn<Article>[] = [
    {
      key: "titre",
      label: "Article",
      render: (article) => (
        <Link href={`/dashboard/articles/${article.id}`} className="block max-w-[26rem] truncate font-medium text-ink hover:text-brand">
          {article.titre}
        </Link>
      ),
    },
    { key: "auteur", label: "Auteur", secondary: true, render: (article) => <span>{article.user.prenom} {article.user.nom}</span> },
    { key: "statut", label: "Statut", render: (article) => <Badge variant={statusVariant(article.statut)} dot>{statusLabel[article.statut]}</Badge> },
    {
      key: "date",
      label: "Date",
      align: "right",
      render: (article) => <span className="tabular whitespace-nowrap text-ink-muted">{new Date(article.createdAt).toLocaleDateString("fr-FR")}</span>,
    },
  ];

  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  const activity: ActivityItem[] = data
    ? [
        ...data.pendingArticles.map((article) => ({
          id: `a-${article.id}`,
          icon: "clock" as const,
          tone: "warning" as const,
          date: article.updatedAt || article.createdAt,
          text: `« ${article.titre} » attend une validation`,
          href: `/dashboard/articles/${article.id}`,
        })),
        ...data.latestComments.map((comment) => ({
          id: `c-${comment.id}`,
          icon: "comment" as const,
          tone: "info" as const,
          date: comment.createdAt,
          text: `${comment.nomAuteur} a commenté « ${comment.article.titre} »`,
          href: `/dashboard/articles/${comment.article.id}`,
        })),
      ]
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))
        .slice(0, 6)
    : [];

  return (
    <div className="space-y-6">
      {/* Accueil : contexte immédiat + action principale */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body text-ink-soft">
          {user ? <>Bonjour <span className="font-medium text-ink">{user.prenom}</span>.</> : "Bonjour."}{" "}
          {/* Rendue seulement une fois les données chargées : au prérendu, la date
              serait figée au moment du build et divergerait à l'hydratation. */}
          {data && <><span className="inline-block first-letter:uppercase">{today}</span>.</>}
        </p>
        {user?.role !== "editeur" && (
          <ButtonLink href="/dashboard/articles/new" icon="plus">Nouvel article</ButtonLink>
        )}
      </div>

      {/* Niveau 1 — vue globale */}
      <StatStrip
        loading={!data}
        stats={
          data
            ? [
                { label: "Articles publiés", value: data.stats.articles.PUBLIE, icon: "checkCircle", hint: "En ligne sur le site" },
                { label: "En attente", value: data.stats.articles.EN_ATTENTE, icon: "clock", hint: "À valider par la rédaction" },
                { label: "Commentaires", value: data.stats.totalComments, icon: "comment", hint: "Toutes publications confondues" },
                { label: "Journalistes", value: data.stats.journalistCount, icon: "users", hint: "Comptes de rédaction actifs" },
              ]
            : []
        }
      />

      {/* Niveau 2 — analyse */}
      <div className="grid items-start gap-6 xl:grid-cols-3">
        <Panel
          title="Flux éditorial"
          description="Répartition des articles par étape du circuit de validation."
          className={canReview ? "xl:col-span-2" : "xl:col-span-3"}
        >
          {data ? (
            <PipelineChart
              segments={[
                { label: "Publiés", value: data.stats.articles.PUBLIE, className: "bg-brand", href: "/dashboard/articles?status=PUBLIE" },
                { label: "En attente", value: data.stats.articles.EN_ATTENTE, className: "bg-warning", href: "/dashboard/articles?status=EN_ATTENTE" },
                { label: "Brouillons", value: data.stats.articles.BROUILLON, className: "bg-gray-300", href: "/dashboard/articles?status=BROUILLON" },
                { label: "Refusés", value: data.stats.articles.REFUSE, className: "bg-error", href: "/dashboard/articles?status=REFUSE" },
              ]}
            />
          ) : (
            <div className="space-y-3">
              <Skeleton className="h-2.5 w-full" />
              {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-6 w-full" />)}
            </div>
          )}
        </Panel>

        {canReview && (
        <Panel
          title="File de validation"
          description="Les plus anciens en premier."
          action={data && data.pendingArticles.length > 0 ? (
            <Link href="/dashboard/articles?status=EN_ATTENTE" className="text-body-sm font-medium text-brand hover:underline">Tout voir</Link>
          ) : undefined}
        >
          {!data ? (
            <div className="space-y-3">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-10 w-full" />)}</div>
          ) : data.pendingArticles.length === 0 ? (
            <EmptyState compact icon="checkCircle" title="Rien à valider" description="Aucun article n’attend de relecture." />
          ) : (
            <ul className="space-y-1">
              {data.pendingArticles.map((article) => (
                <li key={article.id}>
                  <Link href={`/dashboard/articles/${article.id}`} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-gray-50">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body font-medium text-ink">{article.titre}</span>
                      <span className="block truncate text-caption text-ink-muted">{article.user.prenom} {article.user.nom}</span>
                    </span>
                    <Icon name="chevronRight" size={14} className="text-ink-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        )}
      </div>

      {/* Niveau 3 — activité */}
      <div className="grid items-start gap-6 xl:grid-cols-3">
        <section className="space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-h3 font-semibold text-ink">Articles récents</h2>
            <Link href="/dashboard/articles" className="flex items-center gap-1 text-body-sm font-medium text-brand hover:underline">
              Tous les articles
              <Icon name="arrowUpRight" size={13} />
            </Link>
          </div>
          <Table
            loading={!data}
            skeletonRows={5}
            columns={columns}
            rows={data?.latestArticles || []}
            rowKey={(article) => article.id}
            empty={<EmptyState icon="article" title="Aucun article" description="Les articles créés par la rédaction apparaîtront ici." />}
          />
          {data && (
            <Pagination
              page={data.latestArticlesPagination.page}
              totalPages={data.latestArticlesPagination.totalPages}
              total={data.latestArticlesPagination.total}
              unit="article"
              onChange={setPage}
            />
          )}
        </section>

        <Panel title="Activité récente" className="xl:sticky xl:top-20">
          {data ? <ActivityList items={activity} /> : <div className="space-y-3">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-12 w-full" />)}</div>}
        </Panel>
      </div>
    </div>
  );
}

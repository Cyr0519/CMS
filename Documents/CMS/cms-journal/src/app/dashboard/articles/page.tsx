"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import PageHeader from "@/components/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Icon from "@/components/ui/Icon";
import IconButton from "@/components/ui/IconButton";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import Select from "@/components/ui/Select";
import Table, { type TableColumn } from "@/components/ui/Table";
import Toast from "@/components/ui/Toast";
import type { Role } from "@/lib/use-current-user";

type Article = { id: number; userId: number; titre: string; statut: string; updatedAt: string; user: { id: number; nom: string; prenom: string }; category: { id: number; nom: string }; images: Array<{ chemin: string }> };
type Category = { id: number; nom: string };
type User = { id: number; nom: string; prenom: string };
type PageInfo = { page: number; limit: number; total: number; totalPages: number };
type NestedData = { articles?: Article[]; categories?: Category[]; currentUser?: { id: number; role: Role }; pagination?: PageInfo };
type ArticlesResponse = { articles?: Article[]; categories?: Category[]; currentUser?: { id: number; role: Role }; pagination?: PageInfo; data?: Article[] | NestedData; error?: string };

const statuses = ["BROUILLON", "EN_ATTENTE", "PUBLIE", "REFUSE"];
const labels: Record<string, string> = { BROUILLON: "Brouillon", EN_ATTENTE: "En attente", PUBLIE: "Publié", REFUSE: "Refusé", ARCHIVE: "Archivé" };
const variant = (status: string) => (status === "PUBLIE" ? "success" : status === "EN_ATTENTE" ? "warning" : status === "REFUSE" ? "danger" : "default");

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: number; role: Role } | null>(null);
  const [pagination, setPagination] = useState<PageInfo>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    void Promise.resolve().then(() => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get("search") || "");
      setStatus(params.get("status") || "");
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);
    if (status) params.set("statut", status);
    if (categoryId) params.set("categoryId", categoryId);
    if (authorId) params.set("authorId", authorId);
    try {
      const response = await fetch(`/api/articles?${params}`, { cache: "no-store" });
      const result = (await response.json()) as ArticlesResponse;
      if (!response.ok) throw new Error(result.error || "Impossible de charger les articles");
      const nested = result.data && !Array.isArray(result.data) ? result.data : undefined;
      setArticles(Array.isArray(result.data) ? result.data : result.articles || nested?.articles || []);
      setCategories(result.categories || nested?.categories || []);
      setCurrentUser(result.currentUser || nested?.currentUser || null);
      setPagination(result.pagination || nested?.pagination || { page, limit: 10, total: 0, totalPages: 0 });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Une erreur est survenue"); }
    finally { setLoading(false); }
  }, [authorId, categoryId, page, search, status]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  useEffect(() => {
    if (currentUser?.role !== "administrateur") return;
    void fetch("/api/users", { cache: "no-store" }).then(async (response) => {
      const result = (await response.json()) as { data?: User[] };
      setAuthors(result.data || []);
    });
  }, [currentUser?.role]);

  async function remove() {
    if (!deleteTarget) return;
    setDeleting(true);
    const response = await fetch(`/api/articles/${deleteTarget.id}`, { method: "DELETE" });
    const result = (await response.json()) as { error?: string };
    setDeleting(false);
    if (!response.ok) { setError(result.error || "Suppression impossible"); return; }
    setDeleteTarget(null); setToast("Article supprimé"); await load();
  }

  function resetFilters() {
    setSearch(""); setStatus(""); setCategoryId(""); setAuthorId(""); setPage(1);
  }

  const filtersActive = Boolean(search || status || categoryId || authorId);

  const columns = useMemo<TableColumn<Article>[]>(() => [
    {
      key: "titre",
      label: "Article",
      render: (article) => (
        <div className="flex items-center gap-3">
          <span className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-gray-100">
            {article.images?.[0]
              ? <Image src={article.images[0].chemin} alt="" fill sizes="40px" className="object-cover" />
              : <span className="flex h-full items-center justify-center text-ink-muted"><Icon name="image" size={15} /></span>}
          </span>
          <Link href={`/dashboard/articles/${article.id}`} className="min-w-0">
            <span className="block max-w-[22rem] truncate font-medium text-ink transition hover:text-brand">{article.titre}</span>
            <span className="block text-caption text-ink-muted">{article.category.nom}</span>
          </Link>
        </div>
      ),
    },
    { key: "auteur", label: "Auteur", secondary: true, render: (article) => <span>{article.user.prenom} {article.user.nom}</span> },
    { key: "statut", label: "Statut", render: (article) => <Badge variant={variant(article.statut)} dot>{labels[article.statut]}</Badge> },
    { key: "date", label: "Mise à jour", align: "right", render: (article) => <span className="tabular whitespace-nowrap text-ink-muted">{new Date(article.updatedAt).toLocaleDateString("fr-FR")}</span> },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (article) => (
        <div className="flex justify-end gap-0.5">
          <Link href={`/dashboard/articles/${article.id}`} aria-label={`Voir « ${article.titre} »`} title="Voir" className="inline-flex size-8 items-center justify-center rounded-full text-ink-muted hover:bg-gray-100 hover:text-ink">
            <Icon name="eye" size={16} />
          </Link>
          {article.statut !== "PUBLIE" && (article.userId === currentUser?.id || currentUser?.role === "administrateur") && (
            <Link href={`/dashboard/articles/${article.id}?edit=1`} aria-label={`Modifier « ${article.titre} »`} title="Modifier" className="inline-flex size-8 items-center justify-center rounded-full text-ink-muted hover:bg-gray-100 hover:text-ink">
              <Icon name="edit" size={16} />
            </Link>
          )}
          {currentUser?.role === "administrateur" && (
            <IconButton icon="trash" label={`Supprimer « ${article.titre} »`} variant="destructive" onClick={() => setDeleteTarget(article)} />
          )}
        </div>
      ),
    },
  ], [currentUser]);

  return (
    <div>
      <PageHeader
        description="Gérez et suivez les contenus éditoriaux de la rédaction."
        actions={currentUser?.role !== "editeur" ? <ButtonLink href="/dashboard/articles/new" icon="plus">Nouvel article</ButtonLink> : undefined}
      />

      {/* Filtres : une seule surface segmentée, dans la continuité du tableau */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Rechercher un article</span>
          <Icon name="search" size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="Rechercher un article…"
            className="h-10 w-full rounded-full border border-line bg-surface-sunken pl-9 pr-4 text-body text-ink placeholder:text-ink-muted focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/15"
          />
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:border-l lg:border-line lg:pl-3">
          <Select aria-label="Filtrer par statut" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 lg:w-44">
            <option value="">Tous les statuts</option>
            {statuses.map((item) => <option key={item} value={item}>{labels[item]}</option>)}
          </Select>
          <Select aria-label="Filtrer par catégorie" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(1); }} className="h-10 lg:w-48">
            <option value="">Toutes les catégories</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.nom}</option>)}
          </Select>
          {currentUser?.role === "administrateur" && (
            <Select aria-label="Filtrer par auteur" value={authorId} onChange={(event) => { setAuthorId(event.target.value); setPage(1); }} className="h-10 lg:w-44">
              <option value="">Tous les auteurs</option>
              {authors.map((author) => <option key={author.id} value={author.id}>{author.prenom} {author.nom}</option>)}
            </Select>
          )}
          {filtersActive && <Button variant="ghost" icon="close" onClick={resetFilters}>Réinitialiser</Button>}
        </div>
      </div>

      {error && !deleteTarget && <div className="mb-4"><ErrorState compact message={error} onRetry={() => void load()} /></div>}

      <Table
        loading={loading}
        columns={columns}
        rows={articles}
        rowKey={(article) => article.id}
        empty={
          <EmptyState
            icon="article"
            title={filtersActive ? "Aucun résultat" : "Aucun article"}
            description={filtersActive ? "Aucun contenu ne correspond à ces filtres." : "Commencez par rédiger le premier article de la rédaction."}
            action={filtersActive
              ? <Button variant="secondary" icon="refresh" onClick={resetFilters}>Réinitialiser les filtres</Button>
              : currentUser?.role !== "editeur" ? <ButtonLink href="/dashboard/articles/new" icon="plus">Nouvel article</ButtonLink> : undefined}
          />
        }
      />

      {!loading && articles.length > 0 && (
        <div className="mt-4">
          <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} unit="article" onChange={setPage} />
        </div>
      )}

      <Modal
        open={Boolean(deleteTarget)}
        title="Supprimer l’article"
        description="Cette action est définitive et ne peut pas être annulée."
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Annuler</Button>
            <Button variant="destructive" icon="trash" loading={deleting} onClick={() => void remove()}>Supprimer</Button>
          </>
        }
      >
        <p className="text-body text-ink-soft">
          « <span className="font-medium text-ink">{deleteTarget?.titre}</span> » sera retiré du CMS ainsi que ses images et ses commentaires.
        </p>
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}

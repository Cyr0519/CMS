"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import Table, { type TableColumn } from "@/components/ui/Table";
import Toast from "@/components/ui/Toast";

type Role = "administrateur" | "editeur" | "journaliste";
type Article = { id: number; userId: number; titre: string; statut: string; updatedAt: string; user: { id: number; nom: string; prenom: string }; category: { id: number; nom: string }; images: Array<{ chemin: string }> };
type Category = { id: number; nom: string };
type User = { id: number; nom: string; prenom: string };
type Pagination = { page: number; limit: number; total: number; totalPages: number };
type NestedData = { articles?: Article[]; categories?: Category[]; currentUser?: { id: number; role: Role }; pagination?: Pagination };
type ArticlesResponse = { articles?: Article[]; categories?: Category[]; currentUser?: { id: number; role: Role }; pagination?: Pagination; data?: Article[] | NestedData; error?: string };

const statuses = ["BROUILLON", "EN_ATTENTE", "PUBLIE", "REFUSE"];
const labels: Record<string, string> = { BROUILLON: "Brouillon", EN_ATTENTE: "En attente", PUBLIE: "Publié", REFUSE: "Refusé" };
const variant = (status: string) => status === "PUBLIE" ? "success" : status === "EN_ATTENTE" ? "warning" : status === "REFUSE" ? "danger" : "default";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: number; role: Role } | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
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
    const response = await fetch(`/api/articles/${deleteTarget.id}`, { method: "DELETE" });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) { setError(result.error || "Suppression impossible"); return; }
    setDeleteTarget(null); setToast("Article supprimé"); await load();
  }

  const columns = useMemo<TableColumn<Article>[]>(() => [
    { key: "image", label: "Image", render: (article) => <div className="relative h-8 w-12 overflow-hidden rounded bg-gray-100">{article.images?.[0] ? <Image src={article.images[0].chemin} alt="" fill className="object-cover" /> : <span className="flex h-full items-center justify-center text-xs text-gray-400">📰</span>}</div> },
    { key: "titre", label: "Titre", render: (article) => <p className="max-w-72 truncate font-medium text-primary">{article.titre}</p> },
    { key: "auteur", label: "Auteur", render: (article) => <span className="text-gray-600">{article.user.prenom} {article.user.nom}</span> },
    { key: "categorie", label: "Catégorie", render: (article) => <Badge variant="info">{article.category.nom}</Badge> },
    { key: "statut", label: "Statut", render: (article) => <Badge variant={variant(article.statut)}>{labels[article.statut]}</Badge> },
    { key: "date", label: "Date", render: (article) => <span className="whitespace-nowrap text-gray-500">{new Date(article.updatedAt).toLocaleDateString("fr-FR")}</span> },
    { key: "actions", label: "Actions", render: (article) => <div className="flex gap-1"><Link href={`/dashboard/articles/${article.id}`} aria-label="Voir" className="rounded-lg p-2 hover:bg-gray-100">👁️</Link>{article.statut !== "PUBLIE" && (article.userId === currentUser?.id || currentUser?.role === "administrateur") && <Link href={`/dashboard/articles/${article.id}?edit=1`} aria-label="Modifier" className="rounded-lg p-2 hover:bg-gray-100">✏️</Link>}{currentUser?.role === "administrateur" && <button type="button" onClick={() => setDeleteTarget(article)} aria-label="Supprimer" className="rounded-lg p-2 hover:bg-red-50">🗑️</button>}</div> },
  ], [currentUser]);

  const pages = Array.from({ length: Math.min(5, pagination.totalPages) }, (_, index) => {
    const start = Math.max(1, Math.min(page - 2, pagination.totalPages - 4)); return start + index;
  });

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-3xl font-semibold tracking-tight">Articles</h2><p className="mt-1 text-gray-500">Gérez et suivez vos contenus éditoriaux.</p></div>{currentUser?.role !== "editeur" && <Link href="/dashboard/articles/new" className="rounded-lg bg-accent px-4 py-2 font-medium text-white transition hover:bg-[#d63852] active:scale-95">Nouvel article</Link>}</div>
    <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm lg:flex-row"><Input aria-label="Rechercher" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} iconLeft="🔍" placeholder="Rechercher un article..." className="rounded-full bg-gray-100 lg:w-72" /><Select aria-label="Statut" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Tous les statuts</option>{statuses.map((item) => <option key={item} value={item}>{labels[item]}</option>)}</Select><Select aria-label="Catégorie" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(1); }}><option value="">Toutes les catégories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.nom}</option>)}</Select>{currentUser?.role === "administrateur" && <Select aria-label="Auteur" value={authorId} onChange={(event) => { setAuthorId(event.target.value); setPage(1); }}><option value="">Tous les auteurs</option>{authors.map((author) => <option key={author.id} value={author.id}>{author.prenom} {author.nom}</option>)}</Select>}</div>
    {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-danger">{error}</p>}
    {loading ? <Skeleton className="h-[480px]" /> : <Table columns={columns} rows={articles} rowKey={(article) => article.id} empty={<EmptyState icon="📰" title="Aucun article" description="Aucun contenu ne correspond à vos filtres." />} />}
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-gray-500">{pagination.total} article(s)</p><div className="flex items-center gap-1"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Précédent</Button>{pages.map((number) => <button key={number} type="button" onClick={() => setPage(number)} className={`size-9 rounded-lg text-sm font-medium ${number === page ? "bg-accent text-white" : "text-gray-600 hover:bg-white"}`}>{number}</button>)}<Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Suivant</Button></div></div>
    <Modal open={Boolean(deleteTarget)} title="Supprimer l’article" onClose={() => setDeleteTarget(null)}><p className="text-gray-600">Cette action supprimera définitivement « {deleteTarget?.titre} ».</p><div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setDeleteTarget(null)}>Annuler</Button><Button variant="danger" onClick={() => void remove()}>Supprimer</Button></div></Modal>
    {toast && <Toast message={toast} onClose={() => setToast("")} />}
  </div>;
}

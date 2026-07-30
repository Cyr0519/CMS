"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import Table, { type TableColumn } from "@/components/ui/Table";
import Toast from "@/components/ui/Toast";

type Comment = { id: number; nomAuteur: string; email: string; contenu: string; statut: "ACTIF" | "SUPPRIME"; createdAt: string; article: { id: number; titre: string } };
type Pagination = { page: number; total: number; totalPages: number };

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, total: 0, totalPages: 0 });
  const [target, setTarget] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const params = new URLSearchParams({ page: String(page), limit: "10" }); if (status) params.set("statut", status);
    const response = await fetch(`/api/comments?${params}`, { cache: "no-store" });
    const result = (await response.json()) as { data?: Comment[]; pagination?: Pagination; error?: string };
    if (response.ok) { setComments(result.data || []); setPagination(result.pagination || { page, total: 0, totalPages: 0 }); } else setError(result.error || "Chargement impossible");
    setLoading(false);
  }, [page, status]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function remove() {
    if (!target) return;
    const response = await fetch(`/api/comments/${target.id}`, { method: "DELETE" });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) setError(result.error || "Suppression impossible"); else { setTarget(null); setToast("Commentaire supprimé"); await load(); }
  }

  const columns = useMemo<TableColumn<Comment>[]>(() => [
    { key: "article", label: "Article", render: (comment) => <Link href={`/dashboard/articles/${comment.article.id}`} className="block max-w-52 truncate font-medium text-accent hover:underline">{comment.article.titre}</Link> },
    { key: "auteur", label: "Auteur", render: (comment) => <span className="font-medium text-primary">{comment.nomAuteur}</span> },
    { key: "email", label: "Email", render: (comment) => <span className="text-gray-500">{comment.email || "—"}</span> },
    { key: "contenu", label: "Contenu", render: (comment) => <p className="max-w-xs truncate text-gray-600" title={comment.contenu}>{comment.contenu.slice(0, 100)}</p> },
    { key: "date", label: "Date", render: (comment) => <span className="whitespace-nowrap text-gray-500">{new Date(comment.createdAt).toLocaleDateString("fr-FR")}</span> },
    { key: "statut", label: "Statut", render: (comment) => <Badge variant={comment.statut === "ACTIF" ? "success" : "default"}>{comment.statut === "ACTIF" ? "Actif" : "Supprimé"}</Badge> },
    { key: "actions", label: "Actions", render: (comment) => comment.statut === "ACTIF" ? <Button variant="ghost" size="sm" className="text-danger" onClick={() => setTarget(comment)}>🗑️ Supprimer</Button> : <span className="text-gray-400">—</span> },
  ], []);

  return <div className="space-y-6"><div><h2 className="text-3xl font-semibold tracking-tight">Commentaires</h2><p className="mt-1 text-gray-500">Modérez les échanges autour des articles.</p></div><div className="max-w-xs rounded-xl bg-white p-4 shadow-sm"><Select label="Filtrer par statut" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Tous</option><option value="ACTIF">Actifs</option><option value="SUPPRIME">Supprimés</option></Select></div>{error && <p className="rounded-xl bg-red-50 p-4 text-danger">{error}</p>}{loading ? <Skeleton className="h-[460px]" /> : <Table columns={columns} rows={comments} rowKey={(comment) => comment.id} empty={<EmptyState icon="💬" title="Aucun commentaire" />} />}<div className="flex items-center justify-between"><p className="text-sm text-gray-500">{pagination.total} commentaire(s)</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Précédent</Button><span className="px-2 py-1 text-sm text-gray-500">{page} / {Math.max(1, pagination.totalPages)}</span><Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Suivant</Button></div></div><Modal open={Boolean(target)} title="Supprimer le commentaire" onClose={() => setTarget(null)}><p className="text-gray-600">Le commentaire sera masqué du site, mais conservé pour la modération.</p><div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setTarget(null)}>Annuler</Button><Button variant="danger" onClick={() => void remove()}>🗑️ Supprimer</Button></div></Modal>{toast && <Toast message={toast} onClose={() => setToast("")} />}</div>;
}

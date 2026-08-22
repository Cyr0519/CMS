"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import PageHeader from "@/components/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import IconButton from "@/components/ui/IconButton";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import Select from "@/components/ui/Select";
import Table, { type TableColumn } from "@/components/ui/Table";
import Toast from "@/components/ui/Toast";

type Comment = { id: number; nomAuteur: string; email: string; contenu: string; statut: "ACTIF" | "SUPPRIME"; createdAt: string; article: { id: number; titre: string } };
type PageInfo = { page: number; total: number; totalPages: number };

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PageInfo>({ page: 1, total: 0, totalPages: 0 });
  const [target, setTarget] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (status) params.set("statut", status);
    const response = await fetch(`/api/comments?${params}`, { cache: "no-store" });
    const result = (await response.json()) as { data?: Comment[]; pagination?: PageInfo; error?: string };
    if (response.ok) {
      setComments(result.data || []);
      setPagination(result.pagination || { page, total: 0, totalPages: 0 });
    } else setError(result.error || "Chargement impossible");
    setLoading(false);
  }, [page, status]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function remove() {
    if (!target) return;
    const response = await fetch(`/api/comments/${target.id}`, { method: "DELETE" });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) setError(result.error || "Suppression impossible");
    else { setTarget(null); setToast("Commentaire masqué"); await load(); }
  }

  const columns = useMemo<TableColumn<Comment>[]>(() => [
    {
      key: "contenu",
      label: "Commentaire",
      render: (comment) => (
        <div className="min-w-0">
          <p className="max-w-xl truncate text-ink" title={comment.contenu}>{comment.contenu}</p>
          <p className="mt-0.5 text-caption text-ink-muted">
            <span className="font-medium text-ink-soft">{comment.nomAuteur}</span>
            {comment.email ? ` · ${comment.email}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "article",
      label: "Article",
      secondary: true,
      render: (comment) => (
        <Link href={`/dashboard/articles/${comment.article.id}`} className="block max-w-52 truncate font-medium text-brand hover:underline">
          {comment.article.titre}
        </Link>
      ),
    },
    { key: "date", label: "Date", align: "right", render: (comment) => <span className="tabular whitespace-nowrap text-ink-muted">{new Date(comment.createdAt).toLocaleDateString("fr-FR")}</span> },
    { key: "statut", label: "Statut", render: (comment) => <Badge variant={comment.statut === "ACTIF" ? "success" : "default"} dot>{comment.statut === "ACTIF" ? "Publié" : "Masqué"}</Badge> },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (comment) => comment.statut === "ACTIF"
        ? <div className="flex justify-end"><IconButton icon="trash" label={`Masquer le commentaire de ${comment.nomAuteur}`} variant="destructive" onClick={() => setTarget(comment)} /></div>
        : <span className="text-ink-muted">—</span>,
    },
  ], []);

  return (
    <div>
      <PageHeader
        description="Modérez les échanges publiés sous les articles."
        actions={
          <Select aria-label="Filtrer par statut" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-9 w-44">
            <option value="">Tous les commentaires</option>
            <option value="ACTIF">Publiés</option>
            <option value="SUPPRIME">Masqués</option>
          </Select>
        }
      />

      {error && !target && <div className="mb-4"><ErrorState compact message={error} onRetry={() => void load()} /></div>}

      <Table
        loading={loading}
        columns={columns}
        rows={comments}
        rowKey={(comment) => comment.id}
        empty={<EmptyState icon="comment" title="Aucun commentaire" description="Les réactions des lecteurs apparaîtront ici." />}
      />

      {!loading && comments.length > 0 && (
        <div className="mt-4">
          <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} unit="commentaire" onChange={setPage} />
        </div>
      )}

      <Modal
        open={Boolean(target)}
        title="Masquer le commentaire"
        onClose={() => setTarget(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTarget(null)}>Annuler</Button>
            <Button variant="destructive" icon="trash" onClick={() => void remove()}>Masquer</Button>
          </>
        }
      >
        <p className="text-body text-ink-soft">Le commentaire sera retiré du site public, mais conservé pour la modération.</p>
        {target && <p className="mt-3 rounded-xl bg-surface-sunken p-3 text-body-sm text-ink-soft">« {target.contenu} »</p>}
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}

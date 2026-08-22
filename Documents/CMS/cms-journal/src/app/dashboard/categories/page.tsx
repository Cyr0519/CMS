"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import PageHeader from "@/components/PageHeader";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { type TableColumn } from "@/components/ui/Table";
import Textarea from "@/components/ui/Textarea";
import Toast from "@/components/ui/Toast";

type Category = { id: number; nom: string; description: string | null; _count: { articles: number } };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/categories", { cache: "no-store" });
    const result = (await response.json()) as { data?: Category[]; error?: string };
    if (response.ok) setCategories(result.data || []); else setError(result.error || "Chargement impossible");
    setLoading(false);
  }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  function open(category?: Category) {
    setEditing(category || null);
    setNom(category?.nom || "");
    setDescription(category?.description || "");
    setError("");
    setModalOpen(true);
  }

  async function save() {
    setSaving(true); setError("");
    const response = await fetch(editing ? `/api/categories/${editing.id}` : "/api/categories", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, description }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) setError(result.error || "Enregistrement impossible");
    else { setModalOpen(false); setToast(editing ? "Catégorie modifiée" : "Catégorie ajoutée"); await load(); }
    setSaving(false);
  }

  async function remove() {
    if (!deleteTarget) return;
    const response = await fetch(`/api/categories/${deleteTarget.id}`, { method: "DELETE" });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) setError(result.error || "Suppression impossible");
    else { setDeleteTarget(null); setToast("Catégorie supprimée"); await load(); }
  }

  const columns = useMemo<TableColumn<Category>[]>(() => [
    { key: "nom", label: "Catégorie", render: (category) => <span className="font-medium text-ink">{category.nom}</span> },
    { key: "description", label: "Description", secondary: true, render: (category) => <p className="max-w-xl truncate">{category.description || "—"}</p> },
    { key: "articles", label: "Articles", align: "right", render: (category) => <span className="tabular">{category._count.articles}</span> },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (category) => (
        <div className="flex justify-end gap-0.5">
          <IconButton icon="edit" label={`Modifier ${category.nom}`} onClick={() => open(category)} />
          <IconButton icon="trash" label={`Supprimer ${category.nom}`} variant="destructive" onClick={() => setDeleteTarget(category)} />
        </div>
      ),
    },
  ], []);

  return (
    <div>
      <PageHeader
        description="Organisez les sujets traités par la rédaction."
        actions={<Button icon="plus" onClick={() => open()}>Ajouter une catégorie</Button>}
      />

      {error && !modalOpen && !deleteTarget && <div className="mb-4"><ErrorState compact message={error} onRetry={() => void load()} /></div>}

      <Table
        loading={loading}
        skeletonRows={5}
        columns={columns}
        rows={categories}
        rowKey={(category) => category.id}
        empty={<EmptyState icon="tag" title="Aucune catégorie" description="Créez une première catégorie pour classer les articles." action={<Button icon="plus" onClick={() => open()}>Ajouter une catégorie</Button>} />}
      />

      <Modal
        open={modalOpen}
        title={editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button loading={saving} disabled={!nom.trim()} onClick={() => void save()}>Enregistrer</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nom" required value={nom} onChange={(event) => setNom(event.target.value)} placeholder="Politique, Culture, Économie…" />
          <Textarea label="Description" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} hint="Facultative : elle aide la rédaction à choisir la bonne catégorie." />
          {error && <p className="text-body-sm text-error">{error}</p>}
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Supprimer la catégorie"
        description="Cette action est définitive."
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Annuler</Button>
            <Button variant="destructive" icon="trash" onClick={() => void remove()}>Supprimer</Button>
          </>
        }
      >
        <p className="text-body text-ink-soft">
          Confirmer la suppression de « <span className="font-medium text-ink">{deleteTarget?.nom}</span> » ?
          {deleteTarget && deleteTarget._count.articles > 0 && <> Cette catégorie contient {deleteTarget._count.articles} article(s).</>}
        </p>
        {error && <p className="mt-3 text-body-sm text-error">{error}</p>}
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}

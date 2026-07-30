"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import Table, { type TableColumn } from "@/components/ui/Table";
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

  function open(category?: Category) { setEditing(category || null); setNom(category?.nom || ""); setDescription(category?.description || ""); setError(""); setModalOpen(true); }
  async function save() {
    setSaving(true); setError("");
    const response = await fetch(editing ? `/api/categories/${editing.id}` : "/api/categories", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nom, description }) });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) setError(result.error || "Enregistrement impossible"); else { setModalOpen(false); setToast(editing ? "Catégorie modifiée" : "Catégorie ajoutée"); await load(); }
    setSaving(false);
  }
  async function remove() {
    if (!deleteTarget) return;
    const response = await fetch(`/api/categories/${deleteTarget.id}`, { method: "DELETE" });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) setError(result.error || "Suppression impossible"); else { setDeleteTarget(null); setToast("Catégorie supprimée"); await load(); }
  }

  const columns = useMemo<TableColumn<Category>[]>(() => [
    { key: "nom", label: "Nom", render: (category) => <span className="font-medium text-primary">{category.nom}</span> },
    { key: "description", label: "Description", render: (category) => <p className="max-w-xl truncate text-gray-500">{category.description || "—"}</p> },
    { key: "articles", label: "Nombre d’articles", render: (category) => category._count.articles },
    { key: "actions", label: "Actions", render: (category) => <div className="flex gap-2"><button type="button" onClick={() => open(category)} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Modifier">✏️</button><button type="button" onClick={() => setDeleteTarget(category)} className="rounded-lg p-2 hover:bg-red-50" aria-label="Supprimer">🗑️</button></div> },
  ], []);

  return <div className="space-y-6"><div className="flex items-center justify-between gap-4"><div><h2 className="text-3xl font-semibold tracking-tight">Catégories</h2><p className="mt-1 text-gray-500">Organisez les sujets de Grace Info.</p></div><Button onClick={() => open()}>Ajouter une catégorie</Button></div>{error && !modalOpen && <p className="rounded-xl bg-red-50 p-4 text-danger">{error}</p>}{loading ? <Skeleton className="h-96" /> : <Table columns={columns} rows={categories} rowKey={(category) => category.id} empty={<EmptyState icon="🏷️" title="Aucune catégorie" />} />}<Modal open={modalOpen} title={editing ? "Modifier la catégorie" : "Nouvelle catégorie"} onClose={() => setModalOpen(false)}><div className="space-y-4"><Input label="Nom" value={nom} onChange={(event) => setNom(event.target.value)} /> <label className="block text-sm font-medium">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-accent focus:outline-none" /></label>{error && <p className="text-sm text-danger">{error}</p>}<div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button><Button loading={saving} onClick={() => void save()}>Enregistrer</Button></div></div></Modal><Modal open={Boolean(deleteTarget)} title="Supprimer la catégorie" onClose={() => setDeleteTarget(null)}><p className="text-gray-600">Confirmer la suppression de « {deleteTarget?.nom} » ?</p>{error && <p className="mt-3 text-sm text-danger">{error}</p>}<div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setDeleteTarget(null)}>Annuler</Button><Button variant="danger" onClick={() => void remove()}>Supprimer</Button></div></Modal>{toast && <Toast message={toast} onClose={() => setToast("")} />}</div>;
}

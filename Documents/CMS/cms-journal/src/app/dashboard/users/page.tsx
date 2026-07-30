"use client";

import { useCallback, useEffect, useState } from "react";

import Avatar from "@/components/ui/Avatar";
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
type User = { id: number; nom: string; prenom: string; email: string; photo: string | null; isActive: boolean; role: { nomRole: Role } };
type Form = { nom: string; prenom: string; email: string; password: string; photo: string; role: Role };
const empty: Form = { nom: "", prenom: "", email: "", password: "", photo: "", role: "journaliste" };
const roleLabel: Record<Role, string> = { administrateur: "Administrateur", editeur: "Éditeur", journaliste: "Journaliste" };
const roleVariant = (role: Role) => role === "administrateur" ? "danger" : role === "editeur" ? "warning" : "info";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<Form>(empty);
  const [editing, setEditing] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/users", { cache: "no-store" });
    const result = (await response.json()) as { data?: User[]; error?: string };
    if (response.ok) setUsers(result.data || []); else setError(result.error || "Chargement impossible");
    setLoading(false);
  }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  function open(user?: User) {
    setEditing(user || null); setForm(user ? { nom: user.nom, prenom: user.prenom, email: user.email, password: "", photo: user.photo || "", role: user.role.nomRole } : empty); setError(""); setModalOpen(true);
  }
  async function save() {
    setSaving(true); setError("");
    const payload: Record<string, string> = { nom: form.nom, prenom: form.prenom, email: form.email, photo: form.photo, role: form.role };
    if (!editing || form.password) payload.password = form.password;
    const response = await fetch(editing ? `/api/users/${editing.id}` : "/api/users", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) setError(result.error || "Enregistrement impossible"); else { setModalOpen(false); setToast(editing ? "Utilisateur modifié" : "Utilisateur ajouté"); await load(); }
    setSaving(false);
  }
  async function toggle(user: User) {
    const response = await fetch(`/api/users/${user.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !user.isActive }) });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) setError(result.error || "Modification impossible"); else { setToast(user.isActive ? "Utilisateur désactivé" : "Utilisateur activé"); await load(); }
  }
  async function remove() {
    if (!deleteTarget) return;
    const response = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) setError(result.error || "Suppression impossible"); else { setDeleteTarget(null); setToast("Utilisateur supprimé"); await load(); }
  }

  const columns: TableColumn<User>[] = [
    { key: "photo", label: "Photo", render: (user) => <Avatar nom={user.nom} prenom={user.prenom} src={user.photo} size={38} /> },
    { key: "nom", label: "Nom", render: (user) => <span className="font-medium text-primary">{user.nom}</span> },
    { key: "prenom", label: "Prénom", render: (user) => user.prenom },
    { key: "email", label: "Email", render: (user) => <span className="text-gray-500">{user.email}</span> },
    { key: "role", label: "Rôle", render: (user) => <Badge variant={roleVariant(user.role.nomRole)}>{roleLabel[user.role.nomRole]}</Badge> },
    { key: "statut", label: "Statut", render: (user) => <button type="button" role="switch" aria-checked={user.isActive} aria-label={`${user.isActive ? "Désactiver" : "Activer"} ${user.prenom} ${user.nom}`} onClick={() => void toggle(user)} className={`relative h-6 w-12 rounded-full transition ${user.isActive ? "bg-accent" : "bg-gray-200"}`}><span className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${user.isActive ? "left-7" : "left-1"}`} /></button> },
    { key: "actions", label: "Actions", render: (user) => <div className="flex gap-1"><button type="button" onClick={() => open(user)} aria-label="Modifier" className="rounded-lg p-2 hover:bg-gray-100">✏️</button><button type="button" onClick={() => setDeleteTarget(user)} aria-label="Supprimer" className="rounded-lg p-2 hover:bg-red-50">🗑️</button></div> },
  ];

  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-3xl font-semibold tracking-tight">Utilisateurs</h2><p className="mt-1 text-gray-500">Gérez l’équipe éditoriale de Grace Info.</p></div><Button onClick={() => open()}>Ajouter un utilisateur</Button></div>{error && !modalOpen && <p className="rounded-xl bg-red-50 p-4 text-danger">{error}</p>}{loading ? <Skeleton className="h-[460px]" /> : <Table columns={columns} rows={users} rowKey={(user) => user.id} empty={<EmptyState icon="👥" title="Aucun utilisateur" />} />}<Modal open={modalOpen} title={editing ? "Modifier l’utilisateur" : "Nouvel utilisateur"} onClose={() => setModalOpen(false)} maxWidth="max-w-xl"><div className="grid gap-4 sm:grid-cols-2"><Input label="Nom" value={form.nom} onChange={(event) => setForm((value) => ({ ...value, nom: event.target.value }))} /><Input label="Prénom" value={form.prenom} onChange={(event) => setForm((value) => ({ ...value, prenom: event.target.value }))} /><Input label="Email" type="email" value={form.email} onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))} className="sm:col-span-2" /><Input label={editing ? "Nouveau mot de passe (optionnel)" : "Mot de passe"} type="password" value={form.password} onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))} /><Select label="Rôle" value={form.role} onChange={(event) => setForm((value) => ({ ...value, role: event.target.value as Role }))}><option value="journaliste">Journaliste</option><option value="editeur">Éditeur</option><option value="administrateur">Administrateur</option></Select><Input label="URL de la photo" value={form.photo} onChange={(event) => setForm((value) => ({ ...value, photo: event.target.value }))} className="sm:col-span-2" /></div>{error && <p className="mt-4 text-sm text-danger">{error}</p>}<div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button><Button loading={saving} onClick={() => void save()}>Enregistrer</Button></div></Modal><Modal open={Boolean(deleteTarget)} title="Supprimer l’utilisateur" onClose={() => setDeleteTarget(null)}><p className="text-gray-600">Confirmer la suppression de {deleteTarget?.prenom} {deleteTarget?.nom} ?</p>{error && <p className="mt-3 text-sm text-danger">{error}</p>}<div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setDeleteTarget(null)}>Annuler</Button><Button variant="danger" onClick={() => void remove()}>Supprimer</Button></div></Modal>{toast && <Toast message={toast} onClose={() => setToast("")} />}</div>;
}

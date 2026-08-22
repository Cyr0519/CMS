"use client";

import { useCallback, useEffect, useState } from "react";

import PageHeader from "@/components/PageHeader";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Table, { type TableColumn } from "@/components/ui/Table";
import Toast from "@/components/ui/Toast";
import { roleLabels, useCurrentUser, type Role } from "@/lib/use-current-user";

type User = { id: number; nom: string; prenom: string; email: string; photo: string | null; isActive: boolean; role: { nomRole: Role } };
type Form = { nom: string; prenom: string; email: string; password: string; photo: string; role: Role };

const empty: Form = { nom: "", prenom: "", email: "", password: "", photo: "", role: "journaliste" };
const roleVariant = (role: Role) => (role === "administrateur" ? "brand" : role === "editeur" ? "warning" : "info");

export default function UsersPage() {
  const currentUser = useCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<Form>(empty);
  const [editing, setEditing] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // L'éditeur ne fait qu'une chose ici : recruter des journalistes. Toute la
  // gestion fine des comptes (rôles, désactivation, suppression) est réservée
  // à l'administrateur, côté interface comme côté API.
  const isAdmin = currentUser?.role === "administrateur";

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/users", { cache: "no-store" });
    const result = (await response.json()) as { data?: User[]; error?: string };
    if (response.ok) setUsers(result.data || []); else setError(result.error || "Chargement impossible");
    setLoading(false);
  }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  function open(user?: User) {
    setEditing(user || null);
    setForm(user
      ? { nom: user.nom, prenom: user.prenom, email: user.email, password: "", photo: user.photo || "", role: user.role.nomRole }
      : empty);
    setError("");
    setModalOpen(true);
  }

  async function save() {
    setSaving(true); setError("");
    const payload: Record<string, string> = {
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      photo: form.photo,
      role: isAdmin ? form.role : "journaliste",
    };
    if (!editing || form.password) payload.password = form.password;
    const response = await fetch(editing ? `/api/users/${editing.id}` : "/api/users", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) setError(result.error || "Enregistrement impossible");
    else { setModalOpen(false); setToast(editing ? "Utilisateur modifié" : isAdmin ? "Utilisateur ajouté" : "Journaliste ajouté"); await load(); }
    setSaving(false);
  }

  async function toggle(user: User) {
    const response = await fetch(`/api/users/${user.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) setError(result.error || "Modification impossible");
    else { setToast(user.isActive ? "Utilisateur désactivé" : "Utilisateur activé"); await load(); }
  }

  async function remove() {
    if (!deleteTarget) return;
    const response = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) setError(result.error || "Suppression impossible");
    else { setDeleteTarget(null); setToast("Utilisateur supprimé"); await load(); }
  }

  const columns: TableColumn<User>[] = [
    {
      key: "identite",
      label: "Membre",
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar nom={user.nom} prenom={user.prenom} src={user.photo} size={36} />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{user.prenom} {user.nom}</p>
            <p className="truncate text-caption text-ink-muted">{user.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", label: "Rôle", render: (user) => <Badge variant={roleVariant(user.role.nomRole)}>{roleLabels[user.role.nomRole]}</Badge> },
    {
      key: "statut",
      label: "Compte actif",
      align: "right",
      render: (user) => isAdmin ? (
        <button
          type="button"
          role="switch"
          aria-checked={user.isActive}
          aria-label={`${user.isActive ? "Désactiver" : "Activer"} le compte de ${user.prenom} ${user.nom}`}
          onClick={() => void toggle(user)}
          className={`relative h-5 w-9 rounded-full transition ${user.isActive ? "bg-brand" : "bg-gray-300"}`}
        >
          <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow-xs transition-[left] ${user.isActive ? "left-[18px]" : "left-0.5"}`} />
        </button>
      ) : (
        <Badge variant={user.isActive ? "success" : "default"} dot>{user.isActive ? "Actif" : "Désactivé"}</Badge>
      ),
    },
    ...(isAdmin ? [{
      key: "actions",
      label: "",
      align: "right" as const,
      render: (user: User) => (
        <div className="flex justify-end gap-0.5">
          <IconButton icon="edit" label={`Modifier ${user.prenom} ${user.nom}`} onClick={() => open(user)} />
          <IconButton icon="trash" label={`Supprimer ${user.prenom} ${user.nom}`} variant="destructive" onClick={() => setDeleteTarget(user)} />
        </div>
      ),
    }] : []),
  ];

  const addLabel = isAdmin ? "Ajouter un utilisateur" : "Ajouter un journaliste";

  return (
    <div>
      <PageHeader
        description={isAdmin
          ? "Gérez les membres de la rédaction et leurs permissions."
          : "Créez les comptes des journalistes de la rédaction."}
        actions={<Button icon="plus" onClick={() => open()}>{addLabel}</Button>}
      />

      {error && !modalOpen && !deleteTarget && <div className="mb-4"><ErrorState compact message={error} onRetry={() => void load()} /></div>}

      <Table
        loading={loading}
        skeletonRows={5}
        columns={columns}
        rows={users}
        rowKey={(user) => user.id}
        empty={<EmptyState icon="users" title={isAdmin ? "Aucun utilisateur" : "Aucun journaliste"} description="Ajoutez les membres de votre rédaction." action={<Button icon="plus" onClick={() => open()}>{addLabel}</Button>} />}
      />

      <Modal
        open={modalOpen}
        title={editing ? "Modifier l’utilisateur" : isAdmin ? "Nouvel utilisateur" : "Nouveau journaliste"}
        description={editing
          ? "Laissez le mot de passe vide pour le conserver."
          : isAdmin ? undefined : "Le compte sera créé avec le rôle Journaliste."}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button loading={saving} onClick={() => void save()}>Enregistrer</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Prénom" required value={form.prenom} onChange={(event) => setForm((value) => ({ ...value, prenom: event.target.value }))} />
          <Input label="Nom" required value={form.nom} onChange={(event) => setForm((value) => ({ ...value, nom: event.target.value }))} />
          <Input label="Email" type="email" required autoComplete="off" value={form.email} onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))} wrapperClassName="sm:col-span-2" />
          <Input
            label={editing ? "Nouveau mot de passe" : "Mot de passe"}
            type="password"
            autoComplete="new-password"
            hint={editing ? "Facultatif" : "6 caractères minimum"}
            value={form.password}
            onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
          />
          {isAdmin ? (
            <Select label="Rôle" value={form.role} onChange={(event) => setForm((value) => ({ ...value, role: event.target.value as Role }))}>
              <option value="journaliste">Journaliste</option>
              <option value="editeur">Éditeur</option>
              <option value="administrateur">Administrateur</option>
            </Select>
          ) : (
            <div>
              <p className="mb-1.5 text-label font-medium text-ink-soft">Rôle</p>
              <Badge variant="info">Journaliste</Badge>
            </div>
          )}
          <Input label="URL de la photo" value={form.photo} onChange={(event) => setForm((value) => ({ ...value, photo: event.target.value }))} hint="Facultative : les initiales sont utilisées à défaut." wrapperClassName="sm:col-span-2" />
        </div>
        {error && <p className="mt-4 text-body-sm text-error">{error}</p>}
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Supprimer l’utilisateur"
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
          Confirmer la suppression du compte de <span className="font-medium text-ink">{deleteTarget?.prenom} {deleteTarget?.nom}</span> ?
          Pour retirer temporairement un accès, préférez la désactivation du compte.
        </p>
        {error && <p className="mt-3 text-body-sm text-error">{error}</p>}
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}

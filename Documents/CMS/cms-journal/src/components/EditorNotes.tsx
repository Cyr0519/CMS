"use client";

import { useCallback, useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import Icon from "@/components/ui/Icon";
import Skeleton from "@/components/ui/Skeleton";
import Textarea from "@/components/ui/Textarea";

type Role = "administrateur" | "editeur" | "journaliste";
type Note = { id: number; userId: number; contenu: string; createdAt: string; user: { id: number; nom: string; prenom: string } };
type Props = { articleId: number; currentUser: { id: number; role: Role } };

export default function EditorNotes({ articleId, currentUser }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [contenu, setContenu] = useState("");
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const canAdd = currentUser.role === "editeur" || currentUser.role === "administrateur";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/articles/${articleId}/editor-notes`, { cache: "no-store" });
      const result = (await response.json()) as { data?: Note[]; error?: string };
      if (!response.ok) throw new Error(result.error || "Chargement impossible");
      setNotes(result.data || []);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Une erreur est survenue"); }
    finally { setLoading(false); }
  }, [articleId]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function add() {
    setSaving(true); setError("");
    const response = await fetch("/api/editor-notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ articleId, contenu }) });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) setError(result.error || "Ajout impossible"); else { setContenu(""); await load(); }
    setSaving(false);
  }

  async function remove(id: number) {
    const response = await fetch(`/api/editor-notes/${id}`, { method: "DELETE" });
    if (response.ok) await load();
    else { const result = (await response.json()) as { error?: string }; setError(result.error || "Suppression impossible"); }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2">
          <h2 className="text-h3 font-semibold text-ink">Notes éditoriales</h2>
          <span className="tabular rounded-full bg-gray-100 px-2 py-0.5 text-caption font-medium text-ink-soft">{notes.length}</span>
        </span>
        <Icon name="chevronDown" size={16} className={`text-ink-muted transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-5 pb-5">
          {canAdd && (
            <div className="mb-4">
              <Textarea
                rows={2}
                maxLength={2000}
                value={contenu}
                onChange={(event) => setContenu(event.target.value)}
                placeholder="Ajouter une note à l’attention de l’auteur…"
                aria-label="Nouvelle note éditoriale"
              />
              <div className="mt-2 flex justify-end">
                <Button size="sm" icon="plus" loading={saving} disabled={!contenu.trim()} onClick={() => void add()}>Ajouter</Button>
              </div>
            </div>
          )}

          {error && <div className="mb-3"><ErrorState compact message={error} onRetry={() => void load()} /></div>}

          {loading ? (
            <div className="space-y-2">{[0, 1].map((item) => <Skeleton key={item} className="h-16 w-full" />)}</div>
          ) : notes.length === 0 ? (
            <p className="text-body-sm text-ink-muted">Aucune note éditoriale sur cet article.</p>
          ) : (
            <ul className="space-y-2">
              {notes.map((note) => (
                <li key={note.id} className="rounded-xl bg-surface-sunken p-4">
                  <p className="whitespace-pre-wrap text-body leading-relaxed text-ink-soft">{note.contenu}</p>
                  <div className="mt-2 flex items-center justify-between gap-3 text-caption text-ink-muted">
                    <span>{note.user.prenom} {note.user.nom} · {new Date(note.createdAt).toLocaleDateString("fr-FR")}</span>
                    {(note.userId === currentUser.id || currentUser.role === "administrateur") && (
                      <button type="button" onClick={() => void remove(note.id)} className="font-medium text-error hover:underline">Supprimer</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

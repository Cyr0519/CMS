"use client";

import { useCallback, useEffect, useState } from "react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

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
    if (response.ok) await load(); else { const result = (await response.json()) as { error?: string }; setError(result.error || "Suppression impossible"); }
  }

  return <section className="mt-10 border-t border-gray-100 pt-6"><button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 text-left"><span className="flex items-center gap-2 text-xl font-semibold tracking-tight">Notes éditoriales <Badge variant="danger">{notes.length}</Badge></span><span className={`text-gray-400 transition ${open ? "rotate-180" : ""}`}>⌄</span></button>{open && <div className="animate-modal-in pt-5">{canAdd && <div className="mb-5 flex flex-col gap-2 sm:flex-row"><textarea value={contenu} onChange={(event) => setContenu(event.target.value)} rows={2} maxLength={2000} placeholder="Ajouter une note éditoriale..." className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" /><Button loading={saving} disabled={!contenu.trim()} onClick={() => void add()} className="self-end">Ajouter</Button></div>}{error && <p className="mb-3 text-sm text-danger">{error}</p>}{loading ? <p className="text-sm text-gray-500">Chargement…</p> : <div className="space-y-3">{notes.map((note) => <article key={note.id} className="rounded-xl border-l-4 border-red-400 bg-red-50 p-4"><p className="whitespace-pre-wrap text-sm leading-relaxed text-red-800">{note.contenu}</p><div className="mt-2 flex items-center justify-between gap-3 text-xs text-red-500"><span>{note.user.prenom} {note.user.nom} · {new Date(note.createdAt).toLocaleDateString("fr-FR")}</span>{(note.userId === currentUser.id || currentUser.role === "administrateur") && <button type="button" onClick={() => void remove(note.id)} className="font-medium text-danger hover:underline">Supprimer</button>}</div></article>)}{notes.length === 0 && <p className="text-sm text-gray-500">Aucune note éditoriale.</p>}</div>}</div>}</section>;
}

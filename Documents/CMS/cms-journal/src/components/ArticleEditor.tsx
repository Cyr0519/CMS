"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import EditorNotes from "@/components/EditorNotes";
import ImageGallery, { type GalleryImage } from "@/components/ImageGallery";
import ImageUpload from "@/components/ImageUpload";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Toast from "@/components/ui/Toast";

export type Role = "administrateur" | "editeur" | "journaliste";
export type Category = { id: number; nom: string };
export type EditorUser = { id: number; role: Role };
export type EditorArticle = {
  id: number; userId: number; titre: string; slug: string; categoryId: number; resume: string | null;
  contenu: string; statut: string; createdAt: string; updatedAt: string; images: GalleryImage[];
  editorNotes: Array<{ id: number; contenu: string; createdAt: string; user: { nom: string; prenom: string } }>;
};

type Props = { article?: EditorArticle; categories: Category[]; currentUser: EditorUser; onRefresh?: () => Promise<void>; onCancel?: () => void };
const labels: Record<string, string> = { BROUILLON: "Brouillon", EN_ATTENTE: "En attente", PUBLIE: "Publié", REFUSE: "Refusé", ARCHIVE: "Archivé" };
const badgeVariant = (status: string) => status === "PUBLIE" ? "success" : status === "EN_ATTENTE" ? "warning" : status === "REFUSE" ? "danger" : "default";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function ArticleEditor({ article, categories, currentUser, onRefresh, onCancel }: Props) {
  const router = useRouter();
  const [titre, setTitre] = useState(article?.titre || "");
  const [categoryId, setCategoryId] = useState<number>(article?.categoryId ?? 0);
  const [resume, setResume] = useState(article?.resume || "");
  const [contenu, setContenu] = useState(article?.contenu || "");
  const [reviewNote, setReviewNote] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const onSelectionChange = useCallback((files: File[], selectedCover: number) => { setPendingFiles(files); setCoverIndex(selectedCover); }, []);

  async function uploadPending(articleId: number) {
    if (pendingFiles.length === 0) return;
    const ordered = [pendingFiles[coverIndex], ...pendingFiles.filter((_, index) => index !== coverIndex)];
    const formData = new FormData(); formData.set("articleId", String(articleId)); formData.set("imageCouverture", "true");
    ordered.forEach((file) => formData.append("files", file));
    const response = await fetch("/api/images", { method: "POST", body: formData });
    if (!response.ok) { const result = (await response.json()) as { error?: string }; throw new Error(result.error || "Images non enregistrées"); }
  }

  async function save(submit = false) {
    setError("");
    if (titre.trim().length < 3) {
      setError("Le titre doit contenir au moins 3 caractères.");
      return;
    }
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      setError("Veuillez sélectionner une catégorie.");
      return;
    }
    if (!contenu.trim()) {
      setError("Le contenu de l’article est obligatoire.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(article ? `/api/articles/${article.id}` : "/api/articles", {
        method: article ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: titre.trim(),
          categoryId,
          resume: resume.trim(),
          contenu: contenu.trim(),
          ...(!article ? { statut: "BROUILLON" as const } : {}),
        }),
      });
      const result = (await response.json()) as { id?: number; data?: { id?: number }; error?: string };
      const articleId = article?.id || result.id || result.data?.id;
      if (!response.ok || !articleId) throw new Error(result.error || "Enregistrement impossible");
      if (!article) await uploadPending(articleId);
      if (submit) {
        const submitResponse = await fetch(`/api/articles/${articleId}/submit`, { method: "POST" });
        if (!submitResponse.ok) { const submitResult = (await submitResponse.json()) as { error?: string }; throw new Error(submitResult.error || "Soumission impossible"); }
      }
      if (article) { setToast(submit ? "Article envoyé à validation" : "Article enregistré"); await onRefresh?.(); }
      else router.push(`/dashboard/articles/${articleId}`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Une erreur est survenue"); }
    finally { setSaving(false); }
  }

  async function review(status: "PUBLIE" | "REFUSE") {
    setSaving(true); setError("");
    const response = await fetch(`/api/articles/${article?.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statut: status, note: reviewNote }) });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) setError(result.error || "Action impossible");
    else { setToast(status === "PUBLIE" ? "Article publié" : "Article refusé"); await onRefresh?.(); }
    setSaving(false);
  }

  const canSubmit = !article || (article.userId === currentUser.id && (article.statut === "BROUILLON" || article.statut === "REFUSE"));
  const canReview = article?.statut === "EN_ATTENTE" && (currentUser.role === "editeur" || currentUser.role === "administrateur");
  const status = article?.statut || "BROUILLON";

  return <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
    <div className="space-y-6 lg:col-span-2">
<Card className="hover:translate-y-0"><input value={titre} onChange={(event) => setTitre(event.target.value)} placeholder="Titre de l’article" className="w-full border-0 border-b-2 border-gray-200 bg-transparent px-0 py-3 text-xl font-semibold tracking-tight outline-none focus:border-accent" /><label className="mt-5 block text-sm font-medium text-primary">Slug<input disabled value={article?.slug || slugify(titre)} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500" /></label><div className="mt-5"><Select label="Catégorie" value={categoryId || ""} onChange={(event) => setCategoryId(event.target.value ? Number.parseInt(event.target.value, 10) : 0)}><option value="">Sélectionner une catégorie</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.nom}</option>)}</Select></div><label className="mt-5 block text-sm font-medium text-primary">Résumé<textarea value={resume} onChange={(event) => setResume(event.target.value)} rows={3} maxLength={500} placeholder="Chapô de l'article..." className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" /><span className="mt-1 block text-right text-xs text-gray-400">{resume.length}/500</span></label><label className="mt-5 block text-sm font-medium text-primary">Contenu<textarea value={contenu} onChange={(event) => setContenu(event.target.value)} rows={20} placeholder="Rédigez votre article..." className="mt-1.5 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm leading-relaxed focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" /></label></Card>
      <Card className="hover:translate-y-0"><h3 className="mb-4 text-lg font-semibold">Images</h3>{article && <div className="mb-5"><ImageGallery images={article.images} canManage onChange={() => void onRefresh?.()} /></div>}<ImageUpload articleId={article?.id} onUploaded={() => void onRefresh?.()} onSelectionChange={article ? undefined : onSelectionChange} /></Card>
      {article && <EditorNotes articleId={article.id} currentUser={currentUser} />}
    </div>
<aside className="lg:col-span-1"><div className="sticky top-24 space-y-5"><Card className="hover:translate-y-0"><h3 className="text-lg font-semibold">Publication</h3><div className="my-5 flex items-center justify-between"><span className="text-sm text-gray-500">Statut actuel</span><Badge variant={badgeVariant(status)} className="px-3 py-1.5">{labels[status]}</Badge></div>{article && <dl className="mb-5 space-y-2 text-sm"><div className="flex justify-between"><dt className="text-gray-500">Création</dt><dd>{new Date(article.createdAt).toLocaleDateString("fr-FR")}</dd></div><div className="flex justify-between"><dt className="text-gray-500">Modification</dt><dd>{new Date(article.updatedAt).toLocaleDateString("fr-FR")}</dd></div></dl>}{error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-danger">{error}</p>}<div className="space-y-3"><Button variant="outline" loading={saving} className="w-full" onClick={() => void save(false)}>💾 Enregistrer brouillon</Button>{canSubmit && <Button loading={saving} className="w-full" onClick={() => void save(true)}>📤 Envoyer à validation</Button>}{onCancel && <Button variant="ghost" className="w-full" onClick={onCancel}>Annuler l’édition</Button>}</div>{canReview && <div className="mt-5 border-t border-gray-100 pt-5"><Button loading={saving} className="mb-3 w-full" onClick={() => void review("PUBLIE")}>📰 Publier</Button><textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} rows={3} maxLength={1000} placeholder="Note éditoriale (optionnelle)" className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-accent focus:outline-none" /><div className="mt-3 grid grid-cols-2 gap-2"><Button variant="secondary" onClick={() => void review("PUBLIE")}>✅ Valider</Button><Button variant="danger" onClick={() => void review("REFUSE")}>❌ Refuser</Button></div></div>}</Card>{article?.statut === "REFUSE" && article.editorNotes.length > 0 && <div className="rounded-xl border-l-4 border-red-400 bg-red-50 p-4"><h4 className="font-semibold text-red-800">Notes éditoriales</h4>{article.editorNotes.map((note) => <div key={note.id} className="mt-3 text-sm text-red-700"><p>{note.contenu}</p><p className="mt-1 text-xs text-red-500">{note.user.prenom} {note.user.nom} · {new Date(note.createdAt).toLocaleDateString("fr-FR")}</p></div>)}</div>}</div></aside>
    {toast && <Toast message={toast} onClose={() => setToast("")} />}
  </div>;
}

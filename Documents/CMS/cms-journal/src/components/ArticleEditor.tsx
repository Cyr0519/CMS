"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import ArticleReviewActions from "@/components/ArticleReviewActions";
import EditorNotes from "@/components/EditorNotes";
import ImageGallery, { type GalleryImage } from "@/components/ImageGallery";
import ImageUpload from "@/components/ImageUpload";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import Icon from "@/components/ui/Icon";
import Panel from "@/components/ui/Panel";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
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
const badgeVariant = (status: string) => (status === "PUBLIE" ? "success" : status === "EN_ATTENTE" ? "warning" : status === "REFUSE" ? "danger" : "default");

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function ArticleEditor({ article, categories, currentUser, onRefresh, onCancel }: Props) {
  const router = useRouter();
  const [titre, setTitre] = useState(article?.titre || "");
  const [categoryId, setCategoryId] = useState<number>(article?.categoryId ?? 0);
  const [resume, setResume] = useState(article?.resume || "");
  const [contenu, setContenu] = useState(article?.contenu || "");
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

  const canSubmit = !article || (article.userId === currentUser.id && (article.statut === "BROUILLON" || article.statut === "REFUSE"));
  const canReview = article?.statut === "EN_ATTENTE" && (currentUser.role === "editeur" || currentUser.role === "administrateur");
  const status = article?.statut || "BROUILLON";

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          {/* Le titre se saisit à la taille à laquelle il sera lu. */}
          <input
            value={titre}
            onChange={(event) => setTitre(event.target.value)}
            placeholder="Titre de l’article"
            aria-label="Titre de l’article"
            className="w-full border-0 border-b border-line bg-transparent px-0 pb-3 font-display text-h1 font-semibold tracking-tight text-ink outline-none placeholder:text-ink-muted focus:border-brand"
          />
          <p className="mt-2 flex items-center gap-1.5 text-caption text-ink-muted">
            <Icon name="external" size={12} />
            /articles/{article?.slug || slugify(titre) || "…"}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Select
              label="Catégorie"
              required
              value={categoryId || ""}
              onChange={(event) => setCategoryId(event.target.value ? Number.parseInt(event.target.value, 10) : 0)}
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.nom}</option>)}
            </Select>
          </div>

          <div className="mt-4">
            <Textarea
              label="Résumé"
              rows={3}
              maxLength={500}
              counter
              value={resume}
              onChange={(event) => setResume(event.target.value)}
              placeholder="Chapô affiché sur la page d’accueil et dans les listes."
            />
          </div>

          <div className="mt-4">
            <Textarea
              label="Contenu"
              required
              rows={18}
              value={contenu}
              onChange={(event) => setContenu(event.target.value)}
              placeholder="Rédigez votre article…"
              className="bg-surface-sunken font-mono text-body-sm leading-relaxed"
            />
          </div>
        </section>

        <Panel title="Images" description="La première image sert de couverture.">
          {article && article.images.length > 0 && (
            <div className="mb-5">
              <ImageGallery images={article.images} canManage onChange={() => void onRefresh?.()} />
            </div>
          )}
          <ImageUpload articleId={article?.id} onUploaded={() => void onRefresh?.()} onSelectionChange={article ? undefined : onSelectionChange} />
        </Panel>

        {article && <EditorNotes articleId={article.id} currentUser={currentUser} />}
      </div>

      <aside className="lg:sticky lg:top-20">
        <div className="space-y-4">
          <Panel title="Publication">
            <dl className="space-y-2.5 text-body-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">Statut</dt>
                <dd><Badge variant={badgeVariant(status)} dot>{labels[status]}</Badge></dd>
              </div>
              {article && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-ink-muted">Création</dt>
                    <dd className="tabular text-ink-soft">{new Date(article.createdAt).toLocaleDateString("fr-FR")}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-ink-muted">Modification</dt>
                    <dd className="tabular text-ink-soft">{new Date(article.updatedAt).toLocaleDateString("fr-FR")}</dd>
                  </div>
                </>
              )}
            </dl>

            {error && <div className="mt-4"><ErrorState compact message={error} /></div>}

            <div className="mt-5 space-y-2">
              <Button variant="secondary" icon="save" fullWidth loading={saving} onClick={() => void save(false)}>
                Enregistrer le brouillon
              </Button>
              {canSubmit && (
                <Button icon="send" fullWidth loading={saving} onClick={() => void save(true)}>
                  Envoyer à validation
                </Button>
              )}
              {onCancel && <Button variant="ghost" fullWidth onClick={onCancel}>Annuler l’édition</Button>}
            </div>
          </Panel>

          {canReview && article && (
            <Panel title="Relecture" description="Validez l’article ou renvoyez-le à son auteur.">
              <ArticleReviewActions
                articleId={article.id}
                statut={article.statut}
                role={currentUser.role}
                onDone={onRefresh}
                layout="stacked"
              />
            </Panel>
          )}

          {article?.statut === "REFUSE" && article.editorNotes.length > 0 && (
            <div className="rounded-2xl border border-error/25 bg-error-soft p-4">
              <h3 className="flex items-center gap-2 text-h3 font-semibold text-error">
                <Icon name="alertCircle" size={15} />
                Article refusé
              </h3>
              {article.editorNotes.map((note) => (
                <div key={note.id} className="mt-3 text-body-sm text-error">
                  <p className="leading-relaxed">{note.contenu}</p>
                  <p className="mt-1 text-caption opacity-75">
                    {note.user.prenom} {note.user.nom} · {new Date(note.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}

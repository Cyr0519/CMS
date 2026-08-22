"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import Icon from "@/components/ui/Icon";
import IconButton from "@/components/ui/IconButton";

type Props = {
  articleId?: number;
  onUploaded?: () => void;
  onSelectionChange?: (files: File[], coverIndex: number) => void;
};

export default function ImageUpload({ articleId, onUploaded, onSelectionChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);

  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);
  useEffect(() => { onSelectionChange?.(files, coverIndex); }, [coverIndex, files, onSelectionChange]);

  function selectFiles(selected: File[]) {
    const invalid = selected.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024);
    if (invalid) { setError("Formats jpg, png ou webp uniquement, 5 Mo maximum par image."); return; }
    setError(""); setFiles(selected); setCoverIndex(0);
  }

  async function upload() {
    if (!articleId || files.length === 0) return;
    setUploading(true); setError("");
    const ordered = [files[coverIndex], ...files.filter((_, index) => index !== coverIndex)];
    const formData = new FormData();
    formData.set("articleId", String(articleId));
    formData.set("imageCouverture", "true");
    ordered.forEach((file) => formData.append("files", file));
    try {
      const response = await fetch("/api/images", { method: "POST", body: formData });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Upload impossible");
      setFiles([]); setCoverIndex(0); onUploaded?.();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Une erreur est survenue"); }
    finally { setUploading(false); }
  }

  return (
    <div>
      <div
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); selectFiles(Array.from(event.dataTransfer.files)); }}
        className={`flex flex-col items-center rounded-2xl border border-dashed px-6 py-8 text-center transition ${dragging ? "border-brand bg-brand-soft" : "border-line-strong bg-surface-sunken"}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => selectFiles(Array.from(event.target.files || []))}
          className="sr-only"
        />
        <span className="flex size-10 items-center justify-center rounded-full bg-surface text-ink-muted">
          <Icon name="upload" size={18} />
        </span>
        <p className="mt-3 text-body font-medium text-ink">Déposez vos images ici</p>
        <p className="mt-1 text-caption text-ink-muted">JPG, PNG ou WebP · 5 Mo maximum par fichier</p>
        <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={() => inputRef.current?.click()}>Parcourir</Button>
      </div>

      {error && <div className="mt-3"><ErrorState compact message={error} /></div>}

      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {previews.map((preview, index) => (
            <figure key={`${preview.file.name}-${index}`} className={`overflow-hidden rounded-xl border bg-surface ${coverIndex === index ? "border-brand" : "border-line"}`}>
              <div className="relative aspect-video bg-gray-100">
                <Image src={preview.url} alt={preview.file.name} fill unoptimized sizes="200px" className="object-cover" />
                {coverIndex === index && (
                  <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-caption font-medium text-white">Couverture</span>
                )}
              </div>
              <figcaption className="flex items-center gap-1 p-2">
                <button
                  type="button"
                  onClick={() => setCoverIndex(index)}
                  disabled={coverIndex === index}
                  className="min-w-0 flex-1 truncate rounded-full px-2 py-1 text-left text-caption font-medium text-ink-soft hover:bg-gray-100 disabled:opacity-40"
                >
                  {coverIndex === index ? preview.file.name : "Définir comme couverture"}
                </button>
                <IconButton
                  icon="close"
                  label={`Retirer ${preview.file.name}`}
                  size="sm"
                  variant="destructive"
                  onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}
                />
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {articleId && files.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button type="button" icon="upload" loading={uploading} onClick={() => void upload()}>
            Ajouter {files.length} image{files.length > 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </div>
  );
}

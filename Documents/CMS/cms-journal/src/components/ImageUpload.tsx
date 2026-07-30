"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import Button from "@/components/ui/Button";

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

  return <div>
    <div onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); selectFiles(Array.from(event.dataTransfer.files)); }} className={`rounded-xl border-2 border-dashed p-8 text-center transition ${dragging ? "border-accent bg-red-50" : "border-gray-300 hover:border-accent"}`}>
      <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => selectFiles(Array.from(event.target.files || []))} className="sr-only" />
      <span className="text-4xl" aria-hidden="true">🖼️</span><p className="mt-3 font-medium text-primary">Déposez vos images ou cliquez pour parcourir</p><p className="mt-1 text-sm text-gray-500">JPG, PNG ou WebP · 5 Mo maximum</p><Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => inputRef.current?.click()}>Parcourir</Button>
    </div>
    {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    {previews.length > 0 && <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">{previews.map((preview, index) => <div key={`${preview.file.name}-${index}`} className={`overflow-hidden rounded-xl border-2 bg-white ${coverIndex === index ? "border-accent" : "border-transparent"}`}><div className="relative aspect-video"><Image src={preview.url} alt={preview.file.name} fill unoptimized className="object-cover" />{coverIndex === index && <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-1 text-[10px] font-semibold text-white">Couverture</span>}</div><div className="flex items-center gap-2 p-2"><button type="button" onClick={() => setCoverIndex(index)} className="min-w-0 flex-1 truncate text-left text-xs font-medium text-primary">Définir comme couverture</button><button type="button" aria-label={`Supprimer ${preview.file.name}`} onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} className="text-danger">×</button></div></div>)}</div>}
    {articleId && files.length > 0 && <div className="mt-4 flex justify-end"><Button type="button" loading={uploading} onClick={() => void upload()}>Ajouter les images</Button></div>}
  </div>;
}

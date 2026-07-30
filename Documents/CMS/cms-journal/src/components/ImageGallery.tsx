"use client";

import Image from "next/image";
import { useState } from "react";

export type GalleryImage = { id: number; nomFichier: string; chemin: string; imageCouverture: boolean };
type Props = { images: GalleryImage[]; canManage: boolean; onChange: () => void };

export default function ImageGallery({ images, canManage, onChange }: Props) {
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  async function action(imageId: number, method: "PATCH" | "DELETE") {
    setBusyId(imageId);
    setError("");
    try {
      const response = await fetch(`/api/images/${imageId}`, { method });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Action impossible");
      onChange();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Une erreur est survenue");
    } finally {
      setBusyId(null);
    }
  }

  if (images.length === 0) return <p className="text-sm text-slate-500">Aucune image.</p>;
  return <div><div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{images.map((image) => <div key={image.id} className="overflow-hidden rounded-lg border border-slate-200"><div className="relative aspect-video bg-slate-100"><Image src={image.chemin} alt={image.nomFichier} fill className="object-cover" />{image.imageCouverture && <span className="absolute left-2 top-2 rounded-full bg-indigo-600 px-2 py-1 text-xs font-semibold text-white">Couverture</span>}</div>{canManage && <div className="flex flex-wrap gap-2 p-2">{!image.imageCouverture && <button type="button" disabled={busyId === image.id} onClick={() => void action(image.id, "PATCH")} className="text-xs font-medium text-indigo-600 disabled:opacity-50">Définir couverture</button>}<button type="button" disabled={busyId === image.id} onClick={() => void action(image.id, "DELETE")} className="ml-auto text-xs font-medium text-red-600 disabled:opacity-50">Supprimer</button></div>}</div>)}</div>{error && <p className="mt-2 text-sm text-red-600">{error}</p>}</div>;
}

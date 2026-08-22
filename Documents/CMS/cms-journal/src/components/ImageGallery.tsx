"use client";

import Image from "next/image";
import { useState } from "react";

import ErrorState from "@/components/ui/ErrorState";
import IconButton from "@/components/ui/IconButton";

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

  if (images.length === 0) return <p className="text-body-sm text-ink-muted">Aucune image.</p>;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image) => (
          <figure key={image.id} className={`overflow-hidden rounded-xl border bg-surface ${image.imageCouverture ? "border-brand" : "border-line"}`}>
            <div className="relative aspect-video bg-gray-100">
              <Image src={image.chemin} alt={image.nomFichier} fill sizes="200px" className="object-cover" />
              {image.imageCouverture && (
                <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-caption font-medium text-white">Couverture</span>
              )}
            </div>
            {canManage && (
              <figcaption className="flex items-center gap-1 p-2">
                <button
                  type="button"
                  disabled={image.imageCouverture || busyId === image.id}
                  onClick={() => void action(image.id, "PATCH")}
                  className="min-w-0 flex-1 truncate rounded-full px-2 py-1 text-left text-caption font-medium text-ink-soft hover:bg-gray-100 disabled:opacity-40"
                >
                  {image.imageCouverture ? image.nomFichier : "Définir comme couverture"}
                </button>
                <IconButton
                  icon="trash"
                  label={`Supprimer ${image.nomFichier}`}
                  size="sm"
                  variant="destructive"
                  disabled={busyId === image.id}
                  onClick={() => void action(image.id, "DELETE")}
                />
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      {error && <div className="mt-3"><ErrorState compact message={error} /></div>}
    </div>
  );
}

"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import Toast from "@/components/ui/Toast";
import { changeArticleStatus, type ReviewStatus } from "@/lib/article-status";
import type { Role } from "@/lib/use-current-user";

type Props = {
  articleId: number;
  statut: string;
  role: Role;
  onDone?: () => Promise<void> | void;
  /** `stacked` pour la colonne latérale de l'éditeur, `inline` pour un en-tête. */
  layout?: "inline" | "stacked";
};

const dialogs: Partial<Record<ReviewStatus, { title: string; description: string; confirm: string; noteLabel: string; noteHint: string }>> = {
  REFUSE: {
    title: "Refuser l’article",
    description: "L’auteur pourra le corriger puis le resoumettre à validation.",
    confirm: "Refuser",
    noteLabel: "Motif du refus",
    noteHint: "Vivement recommandé : c’est le seul retour que recevra l’auteur.",
  },
  EN_ATTENTE: {
    title: "Dépublier l’article",
    description: "Il est retiré du site public et revient dans la file de validation, d’où il pourra être republié.",
    confirm: "Dépublier",
    noteLabel: "Motif de la dépublication",
    noteHint: "Facultatif : conservé dans les notes éditoriales de l’article.",
  },
};

/**
 * Actions de relecture réservées aux éditeurs et aux administrateurs.
 * Publier est immédiat ; refuser et dépublier passent par une confirmation,
 * car ils retirent l'article de la vue du public ou le renvoient à son auteur.
 */
export default function ArticleReviewActions({ articleId, statut, role, onDone, layout = "inline" }: Props) {
  const [pending, setPending] = useState<ReviewStatus | null>(null);
  const [confirming, setConfirming] = useState<ReviewStatus | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  if (role !== "editeur" && role !== "administrateur") return null;
  if (statut !== "EN_ATTENTE" && statut !== "PUBLIE") return null;

  async function apply(statutCible: ReviewStatus, withNote?: string) {
    setPending(statutCible);
    setError("");
    try {
      await changeArticleStatus(articleId, statutCible, withNote);
      setConfirming(null);
      setNote("");
      setToast(statutCible === "PUBLIE" ? "Article publié" : statutCible === "REFUSE" ? "Article refusé" : "Article dépublié");
      await onDone?.();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Une erreur est survenue");
    } finally {
      setPending(null);
    }
  }

  const dialog = confirming ? dialogs[confirming] : undefined;

  return (
    <>
      <div className={layout === "stacked" ? "space-y-2" : "flex flex-wrap items-center gap-2"}>
        {statut === "EN_ATTENTE" && (
          <>
            <Button
              icon="check"
              size={layout === "inline" ? "sm" : "md"}
              fullWidth={layout === "stacked"}
              loading={pending === "PUBLIE"}
              onClick={() => void apply("PUBLIE")}
            >
              Publier
            </Button>
            <Button
              variant="secondary"
              icon="close"
              size={layout === "inline" ? "sm" : "md"}
              fullWidth={layout === "stacked"}
              onClick={() => { setError(""); setConfirming("REFUSE"); }}
            >
              Refuser
            </Button>
          </>
        )}

        {statut === "PUBLIE" && (
          <Button
            variant="secondary"
            icon="eye"
            size={layout === "inline" ? "sm" : "md"}
            fullWidth={layout === "stacked"}
            onClick={() => { setError(""); setConfirming("EN_ATTENTE"); }}
          >
            Dépublier
          </Button>
        )}
      </div>

      {error && !confirming && <div className="mt-3"><ErrorState compact message={error} /></div>}

      <Modal
        open={Boolean(confirming)}
        title={dialog?.title ?? ""}
        description={dialog?.description}
        onClose={() => { setConfirming(null); setNote(""); }}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setConfirming(null); setNote(""); }}>Annuler</Button>
            <Button
              variant={confirming === "REFUSE" ? "destructive" : "primary"}
              loading={pending === confirming}
              onClick={() => confirming && void apply(confirming, note)}
            >
              {dialog?.confirm}
            </Button>
          </>
        }
      >
        <Textarea
          label={dialog?.noteLabel}
          hint={dialog?.noteHint}
          rows={4}
          maxLength={1000}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        {error && <div className="mt-3"><ErrorState compact message={error} /></div>}
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </>
  );
}

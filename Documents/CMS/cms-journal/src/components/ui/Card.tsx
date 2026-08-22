import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  /** Retrait interne. `none` quand le contenu gère lui-même son padding (tableaux). */
  padding?: "none" | "sm" | "md" | "lg";
  /** Surface teintée, pour les blocs secondaires ou de contexte. */
  tone?: "surface" | "soft";
  /** Réaction au survol : uniquement si la carte entière est cliquable. */
  interactive?: boolean;
};

const paddings = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };

/**
 * Conteneur neutre : bordure fine, pas d'ombre par défaut, pas d'effet de survol.
 * Une carte ne bouge que si elle est réellement cliquable.
 */
export default function Card({ padding = "md", tone = "surface", interactive = false, className = "", ...props }: Props) {
  return (
    <div
      className={`rounded-2xl border border-line ${tone === "soft" ? "bg-surface-soft" : "bg-surface"} ${paddings[padding]} ${interactive ? "cursor-pointer transition hover:border-line-strong hover:shadow-sm" : ""} ${className}`}
      {...props}
    />
  );
}

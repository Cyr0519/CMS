import Image from "next/image";

/** Teinte dérivée du nom : stable, sourde, toujours dans la palette du système. */
function toneFor(value: string) {
  const tones = [
    "bg-brand-soft text-brand-ink",
    "bg-info-soft text-info",
    "bg-warning-soft text-warning",
    "bg-success-soft text-success",
    "bg-gray-200 text-ink-soft",
  ];
  return tones[[...value].reduce((sum, char) => sum + char.charCodeAt(0), 0) % tones.length];
}

export default function Avatar({ nom, prenom = "", src, size = 36 }: { nom: string; prenom?: string; src?: string | null; size?: number }) {
  const initials = `${prenom[0] || ""}${nom[0] || ""}`.toUpperCase();
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium ${toneFor(nom)}`}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.34)) }}
    >
      {src
        ? <Image
            src={src}
            alt={`${prenom} ${nom}`}
            fill
            sizes={`${size}px`}
            // Les photos hébergées ailleurs contournent l'optimiseur : aucune
            // configuration de domaine n'est alors nécessaire au déploiement.
            unoptimized={!src.startsWith("/")}
            className="object-cover"
          />
        : initials}
    </span>
  );
}

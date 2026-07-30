import Image from "next/image";

function colorFor(value: string) {
  const colors = ["bg-indigo-500", "bg-rose-500", "bg-emerald-500", "bg-amber-500", "bg-sky-500"];
  return colors[[...value].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length];
}

export default function Avatar({ nom, prenom = "", src, size = 40 }: { nom: string; prenom?: string; src?: string | null; size?: number }) {
  const initials = `${prenom[0] || ""}${nom[0] || ""}`.toUpperCase();
  return <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold text-white ${colorFor(nom)}`} style={{ width: size, height: size }}>{src ? <Image src={src} alt={`${prenom} ${nom}`} fill className="object-cover" /> : initials}</span>;
}

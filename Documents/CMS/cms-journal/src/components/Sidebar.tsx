"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Role = "administrateur" | "editeur" | "journaliste";
type Props = { open: boolean; onClose: () => void };
type LinkItem = { href: string; label: string; icon: string; roles?: Role[] };

const sections: Array<{ title: string; icon: string; links: LinkItem[] }> = [
  { title: "CONTENU", icon: "📰", links: [
    { href: "/dashboard", label: "Tableau de bord", icon: "▦" },
    { href: "/dashboard/articles", label: "Articles", icon: "▤" },
    { href: "/dashboard/categories", label: "Catégories", icon: "⌑", roles: ["administrateur"] },
  ] },
  { title: "ÉQUIPE", icon: "👥", links: [
    { href: "/dashboard/users", label: "Utilisateurs", icon: "◎", roles: ["administrateur"] },
  ] },
  { title: "MODÉRATION", icon: "💬", links: [
    { href: "/dashboard/comments", label: "Commentaires", icon: "◌", roles: ["editeur", "administrateur"] },
  ] },
];

export default function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    void fetch("/api/auth/me", { cache: "no-store" }).then(async (response) => {
      const result = (await response.json()) as { data?: { role: Role }; user?: { role?: { nomRole?: Role } } };
      setRole(result.data?.role ?? result.user?.role?.nomRole ?? null);
    });
  }, []);

  return <>
    {open && <button type="button" aria-label="Fermer le menu" onClick={onClose} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-primary text-white shadow-xl transition-transform duration-200 ease-out lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-6"><Link href="/dashboard" onClick={onClose} className="text-xl font-bold tracking-wide text-white">Grace Info</Link><button type="button" onClick={onClose} aria-label="Fermer le menu" className="rounded-lg p-1 text-2xl text-gray-400 hover:bg-white/5 hover:text-white lg:hidden">×</button></div>
      <nav className="flex-1 overflow-y-auto py-5">{sections.map((section) => {
        const visibleLinks = section.links.filter((item) => !item.roles || (role && item.roles.includes(role)));
        if (visibleLinks.length === 0) return null;
        return <section key={section.title} className="mb-6"><h2 className="mb-2 px-6 text-[11px] font-semibold tracking-[.16em] text-gray-500"><span className="mr-2" aria-hidden="true">{section.icon}</span>{section.title}</h2><div className="space-y-1">{visibleLinks.map((item) => {
          const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} onClick={onClose} className={`flex items-center gap-3 border-l-4 px-6 py-2.5 text-sm font-medium transition duration-200 ${active ? "border-accent bg-accent/20 text-accent" : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white"}`}><span className="w-5 text-center text-base" aria-hidden="true">{item.icon}</span>{item.label}</Link>;
        })}</div></section>;
      })}</nav>
      <div className="border-t border-white/10 px-6 py-4 text-xs capitalize text-gray-500">{role || "Chargement…"}</div>
    </aside>
  </>;
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import Avatar from "@/components/ui/Avatar";

type Role = "administrateur" | "editeur" | "journaliste";
type User = { nom: string; prenom: string; email: string; role: Role; photo?: string | null };
type Props = { onMenuToggle: () => void };

function pageTitle(pathname: string) {
  if (pathname === "/dashboard") return "Tableau de bord";
  if (pathname.includes("/articles/new")) return "Nouvel article";
  if (/\/articles\/\d+/.test(pathname)) return "Détail de l’article";
  if (pathname.startsWith("/dashboard/articles")) return "Articles";
  if (pathname.startsWith("/dashboard/categories")) return "Catégories";
  if (pathname.startsWith("/dashboard/comments")) return "Commentaires";
  if (pathname.startsWith("/dashboard/users")) return "Utilisateurs";
  return "Grace Info";
}

export default function Header({ onMenuToggle }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [pending, setPending] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    void fetch("/api/auth/me", { cache: "no-store" }).then(async (response) => {
      const result = (await response.json()) as { data?: User; user?: { nom: string; prenom: string; email: string; photo?: string | null; role?: { nomRole?: Role } } };
      if (result.data) setUser(result.data);
      else if (result.user?.role?.nomRole) setUser({ ...result.user, role: result.user.role.nomRole });
    });
  }, []);

  useEffect(() => {
    if (user?.role !== "editeur" && user?.role !== "administrateur") return;
    void fetch("/api/articles?page=1&limit=1&statut=EN_ATTENTE", { cache: "no-store" }).then(async (response) => {
      const result = (await response.json()) as { pagination?: { total: number }; data?: { pagination?: { total: number } } };
      setPending(result.pagination?.total ?? result.data?.pagination?.total ?? 0);
    });
  }, [user?.role]);

  useEffect(() => {
    const close = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setProfileOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login"); router.refresh();
  }

  return <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center border-b border-gray-200 bg-white px-4 lg:left-[260px] lg:px-6">
    <button type="button" onClick={onMenuToggle} aria-label="Ouvrir le menu" className="mr-3 rounded-lg p-2 text-xl text-primary hover:bg-gray-100 lg:hidden">☰</button>
    <h1 className="min-w-0 truncate text-lg font-semibold tracking-tight text-primary">{pageTitle(pathname)}</h1>
    <form className="mx-4 hidden flex-1 justify-center md:flex" onSubmit={(event) => { event.preventDefault(); router.push(`/dashboard/articles?search=${encodeURIComponent(search)}`); }} role="search"><label className="relative w-full max-w-md"><span className="sr-only">Rechercher</span><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Rechercher..." className="w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm text-primary outline-none focus:ring-2 focus:ring-accent/30" /></label></form>
    <div className="ml-auto flex items-center gap-2 sm:gap-4">
      {(user?.role === "editeur" || user?.role === "administrateur") && <button type="button" onClick={() => router.push("/dashboard/articles?status=EN_ATTENTE")} aria-label={`${pending} article(s) en attente`} className="relative rounded-full p-2 text-xl text-gray-500 hover:bg-gray-100 hover:text-primary">♢{pending > 0 && <span className="absolute right-0 top-0 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-4 text-white">{pending > 9 ? "9+" : pending}</span>}</button>}
      <div ref={menuRef} className="relative"><button type="button" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen} aria-haspopup="menu" className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 sm:pr-3"><Avatar nom={user?.nom || "Grace"} prenom={user?.prenom || ""} src={user?.photo} size={36} /><span className="hidden text-left sm:block"><span className="block max-w-32 truncate text-sm font-medium leading-tight text-primary">{user ? `${user.prenom} ${user.nom}` : "Chargement…"}</span><span className="block text-xs capitalize leading-tight text-gray-500">{user?.role}</span></span><span className="hidden text-xs text-gray-400 sm:block">⌄</span></button>{profileOpen && <div role="menu" className="absolute right-0 mt-2 w-56 animate-modal-in rounded-xl border border-gray-100 bg-white p-2 shadow-lg"><div className="border-b border-gray-100 px-3 py-2"><p className="truncate text-sm font-medium text-primary">{user?.email}</p></div><button type="button" role="menuitem" onClick={() => void logout()} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-red-50">Se déconnecter</button></div>}</div>
    </div>
  </header>;
}

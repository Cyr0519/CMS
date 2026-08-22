import type { IconName } from "@/components/ui/Icon";
import type { Role } from "@/lib/use-current-user";

export type NavItem = { href: string; label: string; icon: IconName; roles?: Role[] };
export type NavSection = { title: string; items: NavItem[] };

/** Source unique de la navigation : la sidebar et le fil d'Ariane la partagent. */
export const navSections: NavSection[] = [
  {
    title: "Contenu",
    items: [
      { href: "/dashboard", label: "Tableau de bord", icon: "dashboard" },
      { href: "/dashboard/articles", label: "Articles", icon: "article" },
      { href: "/dashboard/categories", label: "Catégories", icon: "tag", roles: ["administrateur"] },
    ],
  },
  {
    // L'éditeur y accède aussi : il recrute les journalistes, sans pouvoir
    // toucher aux comptes éditeurs ni administrateurs.
    title: "Équipe",
    items: [{ href: "/dashboard/users", label: "Utilisateurs", icon: "users", roles: ["administrateur", "editeur"] }],
  },
  {
    title: "Modération",
    items: [{ href: "/dashboard/comments", label: "Commentaires", icon: "comment", roles: ["editeur", "administrateur"] }],
  },
];

export function isActive(href: string, pathname: string): boolean {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}

export function visibleItems(section: NavSection, role: Role | null): NavItem[] {
  return section.items.filter((item) => !item.roles || (role !== null && item.roles.includes(role)));
}

export type PageMeta = { title: string; parent?: { label: string; href: string } };

/** Titre et fil d'Ariane dérivés de l'URL : aucune page n'a à les redéclarer. */
export function pageMeta(pathname: string): PageMeta {
  const articles = { label: "Articles", href: "/dashboard/articles" };
  if (pathname === "/dashboard") return { title: "Tableau de bord" };
  if (pathname.startsWith("/dashboard/articles/new")) return { title: "Nouvel article", parent: articles };
  if (/^\/dashboard\/articles\/\d+/.test(pathname)) return { title: "Détail de l’article", parent: articles };
  if (pathname.startsWith("/dashboard/articles")) return { title: "Articles" };
  if (pathname.startsWith("/dashboard/categories")) return { title: "Catégories" };
  if (pathname.startsWith("/dashboard/comments")) return { title: "Commentaires" };
  if (pathname.startsWith("/dashboard/users")) return { title: "Utilisateurs" };
  return { title: "Grace Info" };
}

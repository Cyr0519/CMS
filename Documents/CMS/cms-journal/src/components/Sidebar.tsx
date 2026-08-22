"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";
import Tooltip from "@/components/ui/Tooltip";
import { isActive, navSections, visibleItems } from "@/lib/navigation";
import { clearCurrentUser, roleLabels, useCurrentUser } from "@/lib/use-current-user";

type Props = { open: boolean; collapsed: boolean; onClose: () => void; onToggleCollapse: () => void };

/**
 * Panneau de navigation flottant : détaché des bords, coins largement arrondis,
 * état actif matérialisé par une pilule pleine plutôt que par une bordure épaisse.
 * Trois formes : rail replié (desktop), panneau étendu (desktop), tiroir (mobile).
 */
export default function Sidebar({ open, collapsed, onClose, onToggleCollapse }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();
  const role = user?.role ?? null;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearCurrentUser();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={onClose}
          className="animate-overlay-in fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-surface-dark text-ink-inverse transition-[transform,width] duration-200 ease-out lg:inset-y-3 lg:left-3 lg:rounded-3xl ${
          collapsed ? "w-[248px] lg:w-[72px]" : "w-[248px]"
        } ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Identité */}
        <div className={`flex h-16 shrink-0 items-center gap-2.5 ${collapsed ? "lg:justify-center lg:px-0" : ""} px-4`}>
          <Link href="/dashboard" onClick={onClose} className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
              <Icon name="book" size={16} strokeWidth={2} />
            </span>
            <span className={`min-w-0 truncate font-display text-h3 font-semibold tracking-tight ${collapsed ? "lg:hidden" : ""}`}>Grace Info</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="ml-auto rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {navSections.map((section) => {
            const items = visibleItems(section, role);
            if (items.length === 0) return null;
            return (
              <section key={section.title} className="mb-5 last:mb-0">
                <h2 className={`mb-1.5 px-3 text-caption font-medium uppercase tracking-[.12em] text-white/35 ${collapsed ? "lg:hidden" : ""}`}>
                  {section.title}
                </h2>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active = isActive(item.href, pathname);
                    const link = (
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={`flex h-9 items-center gap-3 rounded-full px-3 text-body font-medium transition ${collapsed ? "lg:mx-auto lg:w-12 lg:justify-center lg:px-0" : ""} ${
                          active ? "bg-brand text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon name={item.icon} size={16} strokeWidth={active ? 2 : 1.75} />
                        <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
                      </Link>
                    );
                    return (
                      <li key={item.href} className={collapsed ? "lg:flex lg:justify-center" : ""}>
                        {/* Replié, le libellé n'est plus visible : l'infobulle le restitue. */}
                        {collapsed ? <Tooltip label={item.label}>{link}</Tooltip> : link}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </nav>

        {/* Pied : site public, repli, profil */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <Link
            href="/"
            className={`flex h-9 items-center gap-3 rounded-full px-3 text-body text-white/50 hover:bg-white/10 hover:text-white ${collapsed ? "lg:mx-auto lg:w-12 lg:justify-center lg:px-0" : ""}`}
          >
            <Icon name="external" size={16} />
            <span className={collapsed ? "lg:hidden" : ""}>Voir le site</span>
          </Link>

          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden h-9 w-full items-center gap-3 rounded-full px-3 text-body text-white/50 hover:bg-white/10 hover:text-white lg:flex ${collapsed ? "lg:mx-auto lg:w-12 lg:justify-center lg:px-0" : ""}`}
          >
            <Icon name="panel" size={16} />
            <span className={collapsed ? "lg:hidden" : ""}>Replier le menu</span>
          </button>

          <div className={`mt-2 flex items-center gap-2.5 rounded-2xl bg-white/5 p-2 ${collapsed ? "lg:justify-center lg:bg-transparent lg:p-0" : ""}`}>
            <Avatar nom={user?.nom || "?"} prenom={user?.prenom} src={user?.photo} size={collapsed ? 32 : 34} />
            <div className={`min-w-0 flex-1 ${collapsed ? "lg:hidden" : ""}`}>
              <p className="truncate text-body-sm font-medium text-white">{user ? `${user.prenom} ${user.nom}` : "Chargement…"}</p>
              <p className="truncate text-caption text-white/45">{user ? roleLabels[user.role] : ""}</p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              aria-label="Se déconnecter"
              title="Se déconnecter"
              className={`rounded-full p-2 text-white/45 hover:bg-white/10 hover:text-white ${collapsed ? "lg:hidden" : ""}`}
            >
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

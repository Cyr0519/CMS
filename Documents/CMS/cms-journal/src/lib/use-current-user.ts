"use client";

import { useEffect, useState } from "react";

export type Role = "administrateur" | "editeur" | "journaliste";
export type CurrentUser = { id: number; nom: string; prenom: string; email: string; role: Role; photo?: string | null };

type MeResponse = {
  data?: CurrentUser;
  user?: { id: number; nom: string; prenom: string; email: string; photo?: string | null; role?: { nomRole?: Role } };
};

/**
 * La sidebar et le header ont tous les deux besoin de l'utilisateur courant.
 * La promesse est mise en cache au niveau du module pour n'émettre qu'une
 * seule requête /api/auth/me par chargement de page.
 *
 * Ce cache survit à une navigation côté client : il DOIT donc être vidé à la
 * connexion comme à la déconnexion, sans quoi l'interface continuerait
 * d'afficher le compte précédent après un changement d'utilisateur.
 */
let pending: Promise<CurrentUser | null> | null = null;

export function clearCurrentUser(): void {
  pending = null;
}

function fetchCurrentUser(): Promise<CurrentUser | null> {
  pending ??= fetch("/api/auth/me", { cache: "no-store" })
    .then(async (response) => {
      const result = (await response.json()) as MeResponse;
      if (result.data) return result.data;
      if (result.user?.role?.nomRole) return { ...result.user, role: result.user.role.nomRole };
      return null;
    })
    .catch(() => null);
  return pending;
}

export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);
  useEffect(() => {
    let active = true;
    void fetchCurrentUser().then((result) => { if (active) setUser(result); });
    return () => { active = false; };
  }, []);
  return user;
}

export const roleLabels: Record<Role, string> = {
  administrateur: "Administrateur",
  editeur: "Éditeur",
  journaliste: "Journaliste",
};

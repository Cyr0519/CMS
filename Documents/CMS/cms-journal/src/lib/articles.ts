import type { NextRequest } from "next/server";
import { z } from "zod";

import type { StatutArticle } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const ARTICLE_STATUSES = [
  "BROUILLON",
  "EN_ATTENTE",
  "PUBLIE",
  "REFUSE",
  "ARCHIVE",
] as const;

export const articleInputSchema = z.object({
  titre: z.string().trim().min(3).max(200),
  categoryId: z.coerce.number().int().positive(),
  resume: z.string().trim().max(500).optional().nullable(),
  contenu: z.string().trim().min(1),
});

export const articleCreateSchema = articleInputSchema.extend({
  statut: z.literal("BROUILLON"),
});

export const articleListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  statut: z.enum(ARTICLE_STATUSES).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  authorId: z.coerce.number().int().positive().optional(),
  search: z.string().trim().max(200).optional(),
});

export const statusInputSchema = z.object({
  statut: z.enum(["PUBLIE", "REFUSE", "EN_ATTENTE"]),
  note: z.string().trim().max(1000).optional(),
});

/**
 * Transitions autorisées à un éditeur ou à un administrateur.
 * Un article publié redevient « en attente » : il quitte le site public sans
 * sortir du circuit éditorial, et peut être republié sans repasser par l'auteur.
 */
export const REVIEW_TRANSITIONS: Record<string, readonly string[]> = {
  EN_ATTENTE: ["PUBLIE", "REFUSE"],
  PUBLIE: ["EN_ATTENTE"],
};

export function canReviewTransition(from: string, to: string): boolean {
  return (REVIEW_TRANSITIONS[from] ?? []).includes(to);
}

export type AppRole = "administrateur" | "editeur" | "journaliste";

export interface CurrentUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: AppRole;
}

export async function getCurrentUser(request: NextRequest): Promise<CurrentUser | null> {
  const userId = Number(request.headers.get("x-user-id"));

  if (!Number.isInteger(userId) || userId <= 0) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user || !user.isActive) return null;

  const role = user.role.nomRole as AppRole;
  if (!(["administrateur", "editeur", "journaliste"] as string[]).includes(role)) {
    return null;
  }

  return {
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    role,
  };
}

export function parseArticleId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function canReadArticle(
  user: CurrentUser,
  article: { userId: number; statut: StatutArticle }
): boolean {
  if (user.role === "administrateur") return true;
  if (user.role === "journaliste") return article.userId === user.id;
  return article.statut === "EN_ATTENTE" || article.statut === "PUBLIE";
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "article";
}

export async function generateUniqueSlug(titre: string, excludeId?: number): Promise<string> {
  const base = slugify(titre);
  let slug = base;
  let suffix = 2;

  while (
    await prisma.article.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export function validationMessage(error: z.ZodError): Record<string, string[] | undefined> {
  return z.flattenError(error).fieldErrors;
}

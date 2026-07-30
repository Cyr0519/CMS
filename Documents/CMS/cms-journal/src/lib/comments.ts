import { z } from "zod";

export const publicCommentSchema = z.object({
  nom_auteur: z.string().trim().min(2).max(150),
  email: z.preprocess(
    (value) => value === "" || value === null ? undefined : value,
    z.email().optional()
  ),
  contenu: z.string().trim().min(1).max(2000),
});

export const commentListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  statut: z.enum(["ACTIF", "SUPPRIME"]).optional(),
});

export const commentIdSchema = z.coerce.number().int().positive();

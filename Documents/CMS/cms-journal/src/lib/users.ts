import { z } from "zod";

export const USER_ROLES = ["administrateur", "editeur", "journaliste"] as const;

export const createUserSchema = z.object({
  nom: z.string().trim().min(2).max(100),
  prenom: z.string().trim().min(2).max(100),
  email: z.email(),
  password: z.string().min(6).max(200),
  role: z.enum(USER_ROLES),
  photo: z.string().trim().max(500).optional().nullable(),
});

export const updateUserSchema = z.object({
  nom: z.string().trim().min(2).max(100),
  prenom: z.string().trim().min(2).max(100),
  email: z.email(),
  password: z.string().min(6).max(200).optional(),
  role: z.enum(USER_ROLES),
  photo: z.string().trim().max(500).optional().nullable(),
});

export const userStatusSchema = z.object({ isActive: z.boolean() });
export const userIdSchema = z.coerce.number().int().positive();

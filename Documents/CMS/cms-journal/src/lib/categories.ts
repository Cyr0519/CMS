import { z } from "zod";

export const categorySchema = z.object({ nom: z.string().trim().min(2).max(100), description: z.string().trim().max(500).optional().nullable() });
export const categoryIdSchema = z.coerce.number().int().positive();

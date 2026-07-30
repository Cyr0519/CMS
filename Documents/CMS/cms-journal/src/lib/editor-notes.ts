import { z } from "zod";

export const editorNoteInputSchema = z.object({
  articleId: z.coerce.number().int().positive(),
  contenu: z.string().trim().min(1).max(2000),
});

export const editorNoteIdSchema = z.coerce.number().int().positive();

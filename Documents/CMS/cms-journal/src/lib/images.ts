import path from "node:path";

import { z } from "zod";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const imageUploadSchema = z.object({
  articleId: z.coerce.number().int().positive(),
  imageCouverture: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
});

export const imageIdSchema = z.coerce.number().int().positive();

export const allowedImageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export function imageDiskPath(publicPath: string): string | null {
  const uploadsRoot = path.resolve(process.cwd(), "public", "uploads", "images");
  const relativePath = publicPath.replace(/^\/+uploads\/images\//, "");
  const resolved = path.resolve(uploadsRoot, relativePath);
  const prefix = `${uploadsRoot}${path.sep}`;
  return resolved.startsWith(prefix) ? resolved : null;
}

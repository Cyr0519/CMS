import { unlink } from "node:fs/promises";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/articles";
import { imageDiskPath, imageIdSchema } from "@/lib/images";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

async function imageAndUser(request: NextRequest, rawId: string) {
  const user = await getCurrentUser(request);
  if (!user) return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };

  const parsedId = imageIdSchema.safeParse(rawId);
  if (!parsedId.success) return { error: NextResponse.json({ error: "Identifiant invalide" }, { status: 400 }) };

  const image = await prisma.image.findUnique({ where: { id: parsedId.data }, include: { article: true } });
  if (!image) return { error: NextResponse.json({ error: "Image introuvable" }, { status: 404 }) };
  if (image.article.userId !== user.id && user.role !== "administrateur") {
    return { error: NextResponse.json({ error: "Accès interdit" }, { status: 403 }) };
  }
  return { user, image };
}

export async function PATCH(request: NextRequest, context: Context): Promise<NextResponse> {
  const result = await imageAndUser(request, (await context.params).id);
  if ("error" in result && result.error) return result.error;

  const image = await prisma.$transaction(async (tx) => {
    await tx.image.updateMany({
      where: { articleId: result.image.articleId },
      data: { imageCouverture: false },
    });
    return tx.image.update({ where: { id: result.image.id }, data: { imageCouverture: true } });
  });
  return NextResponse.json({ data: image });
}

export async function DELETE(request: NextRequest, context: Context): Promise<NextResponse> {
  const result = await imageAndUser(request, (await context.params).id);
  if ("error" in result && result.error) return result.error;

  await prisma.image.delete({ where: { id: result.image.id } });
  const diskPath = imageDiskPath(result.image.chemin);
  if (diskPath) await unlink(diskPath).catch(() => undefined);

  return NextResponse.json({ success: true });
}

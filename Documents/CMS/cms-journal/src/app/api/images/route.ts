import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentUser, validationMessage } from "@/lib/articles";
import { allowedImageTypes, imageUploadSchema, MAX_IMAGE_SIZE } from "@/lib/images";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formulaire multipart invalide" }, { status: 400 });
  }

  const parsed = imageUploadSchema.safeParse({
    articleId: formData.get("articleId"),
    imageCouverture: formData.get("imageCouverture") ?? "false",
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: validationMessage(parsed.error) },
      { status: 400 }
    );
  }

  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "Aucune image fournie" }, { status: 400 });

  for (const file of files) {
    if (!(file.type in allowedImageTypes)) {
      return NextResponse.json({ error: "Formats autorisés : jpg, png et webp" }, { status: 415 });
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Chaque image doit peser au maximum 5 Mo" }, { status: 413 });
    }
  }

  const article = await prisma.article.findUnique({ where: { id: parsed.data.articleId } });
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  if (article.userId !== user.id && user.role !== "administrateur") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const directory = path.join(process.cwd(), "public", "uploads", "images", year, month);
  await mkdir(directory, { recursive: true });

  const writtenPaths: string[] = [];
  const records: Array<{
    articleId: number; nomFichier: string; chemin: string; taille: number; imageCouverture: boolean;
  }> = [];

  try {
    for (const [index, file] of files.entries()) {
      const extension = allowedImageTypes[file.type as keyof typeof allowedImageTypes];
      const fileName = `${randomUUID()}.${extension}`;
      const diskPath = path.join(directory, fileName);
      await writeFile(diskPath, Buffer.from(await file.arrayBuffer()));
      writtenPaths.push(diskPath);
      records.push({
        articleId: article.id,
        nomFichier: file.name,
        chemin: `/uploads/images/${year}/${month}/${fileName}`,
        taille: file.size,
        imageCouverture: parsed.data.imageCouverture && index === 0,
      });
    }

    const images = await prisma.$transaction(async (tx) => {
      if (parsed.data.imageCouverture) {
        await tx.image.updateMany({ where: { articleId: article.id }, data: { imageCouverture: false } });
      }
      return Promise.all(records.map((record) => tx.image.create({ data: record })));
    });
    return NextResponse.json({ data: images }, { status: 201 });
  } catch {
    await Promise.all(writtenPaths.map((filePath) => unlink(filePath).catch(() => undefined)));
    return NextResponse.json({ error: "Impossible d’enregistrer les images" }, { status: 500 });
  }
}

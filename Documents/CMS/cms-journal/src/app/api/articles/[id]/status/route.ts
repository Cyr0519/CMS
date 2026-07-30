import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  getCurrentUser,
  parseArticleId,
  statusInputSchema,
  validationMessage,
} from "@/lib/articles";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context): Promise<NextResponse> {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (user.role !== "editeur" && user.role !== "administrateur") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const id = parseArticleId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

  const parsed = statusInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: validationMessage(parsed.error) },
      { status: 400 }
    );
  }

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  if (article.statut !== "EN_ATTENTE") {
    return NextResponse.json({ error: "Seul un article en attente peut être traité" }, { status: 409 });
  }

  const { statut, note } = parsed.data;
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.article.update({
      where: { id },
      data: {
        statut,
        publishedAt: statut === "PUBLIE" ? new Date() : null,
      },
    });

    if (statut === "REFUSE" && note) {
      await tx.editorNote.create({ data: { articleId: id, userId: user.id, contenu: note } });
    }

    return result;
  });

  return NextResponse.json(updated);
}

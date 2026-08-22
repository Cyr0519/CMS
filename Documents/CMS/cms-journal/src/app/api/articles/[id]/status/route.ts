import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  canReviewTransition,
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

  const { statut, note } = parsed.data;
  if (!canReviewTransition(article.statut, statut)) {
    return NextResponse.json(
      { error: "Un article en attente peut être publié ou refusé, un article publié peut être dépublié" },
      { status: 409 }
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.article.update({
      where: { id },
      data: {
        statut,
        // La première date de publication est conservée : une dépublication
        // suivie d'une republication ne réécrit pas l'historique de l'article.
        publishedAt: statut === "PUBLIE" ? article.publishedAt ?? new Date() : article.publishedAt,
      },
    });

    if (note && (statut === "REFUSE" || statut === "EN_ATTENTE")) {
      await tx.editorNote.create({ data: { articleId: id, userId: user.id, contenu: note } });
    }

    return result;
  });

  return NextResponse.json(updated);
}

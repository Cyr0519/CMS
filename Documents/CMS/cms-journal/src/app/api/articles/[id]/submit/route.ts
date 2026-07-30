import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentUser, parseArticleId } from "@/lib/articles";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context): Promise<NextResponse> {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const id = parseArticleId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  if (article.userId !== user.id) {
    return NextResponse.json({ error: "Seul l’auteur peut soumettre cet article" }, { status: 403 });
  }
  if (article.statut !== "BROUILLON" && article.statut !== "REFUSE") {
    return NextResponse.json({ error: "Transition de statut invalide" }, { status: 409 });
  }

  const updated = await prisma.article.update({
    where: { id },
    data: { statut: "EN_ATTENTE" },
  });
  return NextResponse.json(updated);
}

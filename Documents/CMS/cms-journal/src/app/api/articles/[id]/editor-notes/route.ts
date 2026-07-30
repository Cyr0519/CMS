import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentUser, parseArticleId } from "@/lib/articles";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context): Promise<NextResponse> {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const articleId = parseArticleId((await context.params).id);
  if (!articleId) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

  const article = await prisma.article.findUnique({ where: { id: articleId }, select: { userId: true } });
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  if (article.userId !== user.id && user.role !== "editeur" && user.role !== "administrateur") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const notes = await prisma.editorNote.findMany({
    where: { articleId },
    include: { user: { select: { id: true, nom: true, prenom: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: notes });
}

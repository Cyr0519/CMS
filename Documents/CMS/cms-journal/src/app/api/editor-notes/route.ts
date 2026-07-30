import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentUser, validationMessage } from "@/lib/articles";
import { editorNoteInputSchema } from "@/lib/editor-notes";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (user.role !== "editeur" && user.role !== "administrateur") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const parsed = editorNoteInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: validationMessage(parsed.error) },
      { status: 400 }
    );
  }

  const article = await prisma.article.findUnique({ where: { id: parsed.data.articleId }, select: { id: true } });
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

  const note = await prisma.editorNote.create({
    data: { articleId: article.id, userId: user.id, contenu: parsed.data.contenu },
    include: { user: { select: { id: true, nom: true, prenom: true } } },
  });
  return NextResponse.json({ data: note }, { status: 201 });
}

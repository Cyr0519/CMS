import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { validationMessage } from "@/lib/articles";
import { publicCommentSchema } from "@/lib/comments";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ slug: string }> };

export async function POST(request: NextRequest, context: Context): Promise<NextResponse> {
  const parsed = publicCommentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: validationMessage(parsed.error) },
      { status: 400 }
    );
  }

  const { slug } = await context.params;
  const article = await prisma.article.findFirst({
    where: { slug, statut: "PUBLIE" },
    select: { id: true },
  });
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

  const comment = await prisma.comment.create({
    data: {
      articleId: article.id,
      nomAuteur: parsed.data.nom_auteur,
      email: parsed.data.email ?? "",
      contenu: parsed.data.contenu,
      statut: "ACTIF",
    },
    select: { id: true, nomAuteur: true, contenu: true, createdAt: true },
  });
  return NextResponse.json({ data: comment }, { status: 201 });
}

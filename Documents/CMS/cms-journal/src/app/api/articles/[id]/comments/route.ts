import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { validationMessage } from "@/lib/articles";
import { publicCommentSchema } from "@/lib/comments";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: NextRequest, context: Context): Promise<NextResponse> {
  const articleId = parseId((await context.params).id);
  if (!articleId) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

  const article = await prisma.article.findUnique({ where: { id: articleId }, select: { id: true } });
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

  const comments = await prisma.comment.findMany({
    where: { articleId, statut: "ACTIF" },
    select: { id: true, nomAuteur: true, contenu: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: comments });
}

export async function POST(request: NextRequest, context: Context): Promise<NextResponse> {
  const articleId = parseId((await context.params).id);
  if (!articleId) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

  const parsed = publicCommentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: validationMessage(parsed.error) },
      { status: 400 }
    );
  }

  const article = await prisma.article.findUnique({ where: { id: articleId }, select: { id: true } });
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

  const comment = await prisma.comment.create({
    data: {
      articleId,
      nomAuteur: parsed.data.nom_auteur,
      email: parsed.data.email ?? "",
      contenu: parsed.data.contenu,
      statut: "ACTIF",
    },
    select: { id: true, nomAuteur: true, contenu: true, createdAt: true },
  });
  return NextResponse.json({ data: comment }, { status: 201 });
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  articleInputSchema,
  canReadArticle,
  generateUniqueSlug,
  getCurrentUser,
  parseArticleId,
  validationMessage,
} from "@/lib/articles";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context): Promise<NextResponse> {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const id = parseArticleId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, nom: true, prenom: true, email: true } },
      category: true,
      images: { orderBy: { createdAt: "asc" } },
      editorNotes: {
        include: { user: { select: { id: true, nom: true, prenom: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  if (!canReadArticle(user, article)) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const categories = await prisma.category.findMany({ orderBy: { nom: "asc" } });
  return NextResponse.json({ article, categories, currentUser: user });
}

export async function PUT(request: NextRequest, context: Context): Promise<NextResponse> {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const id = parseArticleId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  if (existing.userId !== user.id && user.role !== "administrateur") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }
  if (existing.statut === "PUBLIE") {
    return NextResponse.json({ error: "Un article publié ne peut pas être modifié" }, { status: 409 });
  }

  const parsed = articleInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: validationMessage(parsed.error) },
      { status: 400 }
    );
  }

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...parsed.data,
      resume: parsed.data.resume || null,
      ...(parsed.data.titre !== existing.titre
        ? { slug: await generateUniqueSlug(parsed.data.titre, id) }
        : {}),
    },
    include: { category: true, user: { select: { id: true, nom: true, prenom: true } } },
  });

  return NextResponse.json(article);
}

export async function DELETE(request: NextRequest, context: Context): Promise<NextResponse> {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (user.role !== "administrateur") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const id = parseArticleId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

  const existing = await prisma.article.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

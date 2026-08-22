import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { Prisma } from "@/generated/prisma/client";
import {
  articleCreateSchema,
  articleListSchema,
  generateUniqueSlug,
  getCurrentUser,
  validationMessage,
} from "@/lib/articles";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const parsed = articleListSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Paramètres invalides", details: validationMessage(parsed.error) },
      { status: 400 }
    );
  }

  const { page, limit, statut, categoryId, authorId, search } = parsed.data;
  const roleFilter: Prisma.ArticleWhereInput =
    user.role === "journaliste"
      ? { userId: user.id }
      : user.role === "editeur"
        ? { statut: { in: ["EN_ATTENTE", "PUBLIE"] } }
        : {};
  const where: Prisma.ArticleWhereInput = {
    AND: [
      roleFilter,
      ...(statut ? [{ statut } satisfies Prisma.ArticleWhereInput] : []),
      ...(categoryId ? [{ categoryId } satisfies Prisma.ArticleWhereInput] : []),
      ...(authorId ? [{ userId: authorId } satisfies Prisma.ArticleWhereInput] : []),
      ...(search ? [{ titre: { contains: search, mode: "insensitive" } } satisfies Prisma.ArticleWhereInput] : []),
    ],
  };

  // Lectures seules : Promise.all suffit, pas de transaction à acquérir.
  const [articles, total, categories] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        user: { select: { id: true, nom: true, prenom: true } },
        category: true,
        images: { where: { imageCouverture: true }, take: 1, orderBy: { createdAt: "desc" } },
        _count: { select: { images: true, editorNotes: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
    prisma.category.findMany({ orderBy: { nom: "asc" } }),
  ]);

  return NextResponse.json({
    articles,
    categories,
    currentUser: user,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const parsed = articleCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: validationMessage(parsed.error) },
      { status: 400 }
    );
  }

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });

  const article = await prisma.article.create({
    data: {
      ...parsed.data,
      resume: parsed.data.resume || null,
      userId: user.id,
      slug: await generateUniqueSlug(parsed.data.titre),
      statut: "BROUILLON",
    },
    include: { category: true, user: { select: { id: true, nom: true, prenom: true } } },
  });

  return NextResponse.json(article, { status: 201 });
}

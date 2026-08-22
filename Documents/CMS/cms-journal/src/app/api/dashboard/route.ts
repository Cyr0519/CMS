import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { Prisma } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/articles";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const articleScope: Prisma.ArticleWhereInput =
    user.role === "journaliste"
      ? { userId: user.id }
      : user.role === "editeur"
        ? { statut: { in: ["EN_ATTENTE", "PUBLIE"] } }
        : {};

  const requestedPage = Number(request.nextUrl.searchParams.get("page") || 1);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit = 5;

  const [draftCount, pendingCount, publishedCount, refusedCount, totalComments, totalUsers, journalistCount, latestArticles, latestArticlesTotal, pendingArticles, latestComments] =
    // Lectures seules : Promise.all suffit, pas de transaction à acquérir.
    await Promise.all([
      prisma.article.count({ where: { AND: [articleScope, { statut: "BROUILLON" }] } }),
      prisma.article.count({ where: { AND: [articleScope, { statut: "EN_ATTENTE" }] } }),
      prisma.article.count({ where: { AND: [articleScope, { statut: "PUBLIE" }] } }),
      prisma.article.count({ where: { AND: [articleScope, { statut: "REFUSE" }] } }),
      prisma.comment.count(),
      prisma.user.count(),
      prisma.user.count({ where: { role: { nomRole: "journaliste" } } }),
      prisma.article.findMany({
        where: articleScope,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, nom: true, prenom: true } },
          category: { select: { id: true, nom: true } },
        },
      }),
      prisma.article.count({ where: articleScope }),
      prisma.article.findMany({
        where: user.role === "editeur" || user.role === "administrateur" ? { statut: "EN_ATTENTE" } : { id: -1 },
        take: 5,
        orderBy: { updatedAt: "asc" },
        include: { user: { select: { id: true, nom: true, prenom: true } } },
      }),
      prisma.comment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { article: { select: { id: true, titre: true } } },
      }),
    ]);

  return NextResponse.json({
    data: {
      stats: {
        articles: {
          BROUILLON: draftCount,
          EN_ATTENTE: pendingCount,
          PUBLIE: publishedCount,
          REFUSE: refusedCount,
        },
        totalComments,
        totalUsers,
        journalistCount,
      },
      latestArticles,
      latestArticlesPagination: {
        page,
        limit,
        total: latestArticlesTotal,
        totalPages: Math.ceil(latestArticlesTotal / limit),
      },
      pendingArticles,
      latestComments,
      currentUser: user,
    },
  });
}

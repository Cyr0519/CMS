import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Paramètres de pagination invalides" }, { status: 400 });
  }

  const { page, limit } = parsed.data;
  const where = { statut: "PUBLIE" as const };
  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      select: {
        id: true,
        titre: true,
        slug: true,
        resume: true,
        contenu: true,
        publishedAt: true,
        images: {
          select: { id: true, nomFichier: true, chemin: true, imageCouverture: true },
          orderBy: [{ imageCouverture: "desc" }, { createdAt: "asc" }],
        },
        category: { select: { id: true, nom: true } },
        user: { select: { nom: true, prenom: true } },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({
    data: articles.map(({ user, ...article }) => ({ ...article, author: user })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

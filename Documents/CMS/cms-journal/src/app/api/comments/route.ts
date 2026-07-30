import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentUser, validationMessage } from "@/lib/articles";
import { commentListSchema } from "@/lib/comments";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (user.role !== "editeur" && user.role !== "administrateur") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const parsed = commentListSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Paramètres invalides", details: validationMessage(parsed.error) },
      { status: 400 }
    );
  }
  const { page, limit, statut } = parsed.data;
  const where = statut ? { statut } : {};
  const [comments, total] = await prisma.$transaction([
    prisma.comment.findMany({
      where,
      include: { article: { select: { id: true, titre: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.comment.count({ where }),
  ]);

  return NextResponse.json({
    data: comments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ slug: string }> };

const bodySchema = z.object({ liked: z.boolean() });

/**
 * Compteur de « j'aime » d'un article publié. Le site public n'a pas de
 * comptes lecteurs : on ne stocke donc qu'un total, et c'est le navigateur du
 * visiteur qui se souvient de son propre vote. Suffisant pour un journal, et
 * aucune donnée personnelle n'est conservée.
 */
export async function POST(request: Request, context: Context): Promise<NextResponse> {
  const { slug } = await context.params;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const article = await prisma.article.findFirst({
    where: { slug, statut: "PUBLIE" },
    select: { id: true },
  });
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

  if (parsed.data.liked) {
    const updated = await prisma.article.update({
      where: { id: article.id },
      data: { likes: { increment: 1 } },
      select: { likes: true },
    });
    return NextResponse.json({ data: updated });
  }

  // La condition `likes > 0` est portée par la requête : le compteur ne peut
  // pas devenir négatif, même si deux retraits arrivent en même temps.
  await prisma.article.updateMany({
    where: { id: article.id, likes: { gt: 0 } },
    data: { likes: { decrement: 1 } },
  });
  const current = await prisma.article.findUnique({
    where: { id: article.id },
    select: { likes: true },
  });
  return NextResponse.json({ data: { likes: current?.likes ?? 0 } });
}

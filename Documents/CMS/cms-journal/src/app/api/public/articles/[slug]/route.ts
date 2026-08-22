import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Context): Promise<NextResponse> {
  const { slug } = await context.params;
  const article = await prisma.article.findFirst({
    where: { slug, statut: "PUBLIE" },
    select: {
      id: true,
      titre: true,
      slug: true,
      resume: true,
      contenu: true,
      likes: true,
      publishedAt: true,
      createdAt: true,
      images: {
        select: { id: true, nomFichier: true, chemin: true, imageCouverture: true },
        orderBy: [{ imageCouverture: "desc" }, { createdAt: "asc" }],
      },
      category: { select: { id: true, nom: true } },
      user: { select: { nom: true, prenom: true } },
      comments: {
        where: { statut: "ACTIF" },
        select: { id: true, nomAuteur: true, contenu: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  const { user, ...data } = article;
  return NextResponse.json({ data: { ...data, author: user } });
}

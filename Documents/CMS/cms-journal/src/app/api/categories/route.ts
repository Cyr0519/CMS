import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentUser, validationMessage } from "@/lib/articles";
import { categorySchema } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

export async function GET(): Promise<NextResponse> {
  const categories = await prisma.category.findMany({ include: { _count: { select: { articles: true } } }, orderBy: { nom: "asc" } });
  return NextResponse.json({ data: categories });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (user.role !== "administrateur") return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  const parsed = categorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Données invalides", details: validationMessage(parsed.error) }, { status: 400 });
  try {
    const category = await prisma.category.create({ data: { nom: parsed.data.nom, description: parsed.data.description || null }, include: { _count: { select: { articles: true } } } });
    return NextResponse.json({ data: category }, { status: 201 });
  } catch { return NextResponse.json({ error: "Cette catégorie existe déjà" }, { status: 409 }); }
}

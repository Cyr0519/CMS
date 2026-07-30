import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentUser, validationMessage } from "@/lib/articles";
import { categoryIdSchema, categorySchema } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

async function adminAndId(request: NextRequest, rawId: string) {
  const user = await getCurrentUser(request);
  if (!user) return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  if (user.role !== "administrateur") return { error: NextResponse.json({ error: "Accès interdit" }, { status: 403 }) };
  const id = categoryIdSchema.safeParse(rawId);
  if (!id.success) return { error: NextResponse.json({ error: "Identifiant invalide" }, { status: 400 }) };
  return { id: id.data };
}

export async function PUT(request: NextRequest, context: Context): Promise<NextResponse> {
  const auth = await adminAndId(request, (await context.params).id);
  if ("error" in auth && auth.error) return auth.error;
  const parsed = categorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Données invalides", details: validationMessage(parsed.error) }, { status: 400 });
  const existing = await prisma.category.findUnique({ where: { id: auth.id } });
  if (!existing) return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });
  try {
    const category = await prisma.category.update({ where: { id: auth.id }, data: { nom: parsed.data.nom, description: parsed.data.description || null }, include: { _count: { select: { articles: true } } } });
    return NextResponse.json({ data: category });
  } catch { return NextResponse.json({ error: "Ce nom est déjà utilisé" }, { status: 409 }); }
}

export async function DELETE(request: NextRequest, context: Context): Promise<NextResponse> {
  const auth = await adminAndId(request, (await context.params).id);
  if ("error" in auth && auth.error) return auth.error;
  const category = await prisma.category.findUnique({ where: { id: auth.id }, include: { _count: { select: { articles: true } } } });
  if (!category) return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });
  if (category._count.articles > 0) return NextResponse.json({ error: "Cette catégorie contient encore des articles" }, { status: 409 });
  await prisma.category.delete({ where: { id: category.id } });
  return NextResponse.json({ success: true });
}

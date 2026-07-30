import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentUser, validationMessage } from "@/lib/articles";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUserSchema, userIdSchema } from "@/lib/users";

type Context = { params: Promise<{ id: string }> };

async function adminAndId(request: NextRequest, rawId: string) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  if (currentUser.role !== "administrateur") {
    return { error: NextResponse.json({ error: "Accès interdit" }, { status: 403 }) };
  }
  const parsedId = userIdSchema.safeParse(rawId);
  if (!parsedId.success) return { error: NextResponse.json({ error: "Identifiant invalide" }, { status: 400 }) };
  return { currentUser, id: parsedId.data };
}

const userSelect = {
  id: true, nom: true, prenom: true, email: true, photo: true, isActive: true,
  createdAt: true, updatedAt: true, role: { select: { id: true, nomRole: true } },
} as const;

export async function GET(request: NextRequest, context: Context): Promise<NextResponse> {
  const auth = await adminAndId(request, (await context.params).id);
  if ("error" in auth && auth.error) return auth.error;

  const user = await prisma.user.findUnique({ where: { id: auth.id }, select: userSelect });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  return NextResponse.json({ data: user });
}

export async function PUT(request: NextRequest, context: Context): Promise<NextResponse> {
  const auth = await adminAndId(request, (await context.params).id);
  if ("error" in auth && auth.error) return auth.error;

  const parsed = updateUserSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: validationMessage(parsed.error) },
      { status: 400 }
    );
  }

  const [existing, role] = await Promise.all([
    prisma.user.findUnique({ where: { id: auth.id } }),
    prisma.role.findUnique({ where: { nomRole: parsed.data.role } }),
  ]);
  if (!existing) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  if (!role) return NextResponse.json({ error: "Rôle introuvable" }, { status: 404 });

  try {
    const user = await prisma.user.update({
      where: { id: existing.id },
      data: {
        nom: parsed.data.nom,
        prenom: parsed.data.prenom,
        email: parsed.data.email.toLowerCase(),
        roleId: role.id,
        photo: parsed.data.photo || null,
        ...(parsed.data.password ? { password: await hashPassword(parsed.data.password) } : {}),
      },
      select: userSelect,
    });
    return NextResponse.json({ data: user });
  } catch {
    return NextResponse.json({ error: "Cette adresse email est déjà utilisée" }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest, context: Context): Promise<NextResponse> {
  const auth = await adminAndId(request, (await context.params).id);
  if ("error" in auth && auth.error) return auth.error;

  const user = await prisma.user.findUnique({ where: { id: auth.id }, include: { role: true } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  if (user.role.nomRole === "administrateur") {
    const adminCount = await prisma.user.count({ where: { role: { nomRole: "administrateur" } } });
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Le dernier administrateur ne peut pas être supprimé" }, { status: 409 });
    }
  }

  try {
    await prisma.user.delete({ where: { id: user.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Cet utilisateur possède encore des contenus et ne peut pas être supprimé" },
      { status: 409 }
    );
  }
}

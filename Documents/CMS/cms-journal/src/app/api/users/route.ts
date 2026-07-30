import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentUser, validationMessage } from "@/lib/articles";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/users";

async function requireAdmin(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  if (user.role !== "administrateur") {
    return { error: NextResponse.json({ error: "Accès interdit" }, { status: 403 }) };
  }
  return { user };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if ("error" in auth && auth.error) return auth.error;

  const users = await prisma.user.findMany({
    select: {
      id: true, nom: true, prenom: true, email: true, photo: true, isActive: true,
      createdAt: true, updatedAt: true, role: { select: { id: true, nomRole: true } },
    },
    orderBy: [{ isActive: "desc" }, { nom: "asc" }],
  });
  return NextResponse.json({ data: users });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if ("error" in auth && auth.error) return auth.error;

  const parsed = createUserSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: validationMessage(parsed.error) },
      { status: 400 }
    );
  }

  const role = await prisma.role.findUnique({ where: { nomRole: parsed.data.role } });
  if (!role) return NextResponse.json({ error: "Rôle introuvable" }, { status: 404 });

  try {
    const user = await prisma.user.create({
      data: {
        nom: parsed.data.nom,
        prenom: parsed.data.prenom,
        email: parsed.data.email.toLowerCase(),
        password: await hashPassword(parsed.data.password),
        roleId: role.id,
        photo: parsed.data.photo || null,
      },
      select: {
        id: true, nom: true, prenom: true, email: true, photo: true, isActive: true,
        createdAt: true, role: { select: { id: true, nomRole: true } },
      },
    });
    return NextResponse.json({ data: user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Cette adresse email est déjà utilisée" }, { status: 409 });
  }
}

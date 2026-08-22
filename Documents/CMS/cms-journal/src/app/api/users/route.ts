import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentUser, validationMessage } from "@/lib/articles";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/users";

const userSelect = {
  id: true, nom: true, prenom: true, email: true, photo: true, isActive: true,
  createdAt: true, updatedAt: true, role: { select: { id: true, nomRole: true } },
} as const;

/**
 * Deux rôles gèrent des comptes, avec des périmètres très différents :
 * l'administrateur sur tout le monde, l'éditeur uniquement sur les journalistes
 * (les voir, en créer). Modifier, désactiver ou supprimer reste administrateur.
 */
async function requireUserManager(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  if (user.role !== "administrateur" && user.role !== "editeur") {
    return { error: NextResponse.json({ error: "Accès interdit" }, { status: 403 }) };
  }
  return { user };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserManager(request);
  if ("error" in auth && auth.error) return auth.error;

  const users = await prisma.user.findMany({
    where: auth.user?.role === "editeur" ? { role: { nomRole: "journaliste" } } : {},
    select: userSelect,
    orderBy: [{ isActive: "desc" }, { nom: "asc" }],
  });
  return NextResponse.json({ data: users });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserManager(request);
  if ("error" in auth && auth.error) return auth.error;

  const parsed = createUserSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: validationMessage(parsed.error) },
      { status: 400 }
    );
  }

  if (auth.user?.role === "editeur" && parsed.data.role !== "journaliste") {
    return NextResponse.json(
      { error: "Un éditeur ne peut créer que des comptes journalistes" },
      { status: 403 }
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
      select: userSelect,
    });
    return NextResponse.json({ data: user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Cette adresse email est déjà utilisée" }, { status: 409 });
  }
}

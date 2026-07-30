import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentUser, validationMessage } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import { userIdSchema, userStatusSchema } from "@/lib/users";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context): Promise<NextResponse> {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (currentUser.role !== "administrateur") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const parsedId = userIdSchema.safeParse((await context.params).id);
  if (!parsedId.success) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  const parsed = userStatusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: validationMessage(parsed.error) },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: parsedId.data } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { isActive: parsed.data.isActive },
    select: { id: true, isActive: true },
  });
  return NextResponse.json({ data: updated });
}

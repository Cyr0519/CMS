import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/articles";
import { commentIdSchema } from "@/lib/comments";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, context: Context): Promise<NextResponse> {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (user.role !== "editeur" && user.role !== "administrateur") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const parsedId = commentIdSchema.safeParse((await context.params).id);
  if (!parsedId.success) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

  const comment = await prisma.comment.findUnique({ where: { id: parsedId.data } });
  if (!comment) return NextResponse.json({ error: "Commentaire introuvable" }, { status: 404 });

  const updated = await prisma.comment.update({
    where: { id: comment.id },
    data: { statut: "SUPPRIME" },
  });
  return NextResponse.json({ data: updated });
}

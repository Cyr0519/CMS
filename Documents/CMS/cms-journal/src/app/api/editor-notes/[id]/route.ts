import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/articles";
import { editorNoteIdSchema } from "@/lib/editor-notes";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, context: Context): Promise<NextResponse> {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const parsedId = editorNoteIdSchema.safeParse((await context.params).id);
  if (!parsedId.success) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

  const note = await prisma.editorNote.findUnique({ where: { id: parsedId.data } });
  if (!note) return NextResponse.json({ error: "Note introuvable" }, { status: 404 });
  if (note.userId !== user.id && user.role !== "administrateur") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  await prisma.editorNote.delete({ where: { id: note.id } });
  return NextResponse.json({ success: true });
}

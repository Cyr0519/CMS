import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  cookieStore.set("token", "", { path: "/", maxAge: 0 });

  return NextResponse.json({ success: true });
}

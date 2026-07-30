import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyToken } from "@/lib/auth";

const PUBLIC_PATHS = new Set(["/", "/login", "/api/auth/login", "/api/auth/logout"]);
const PUBLIC_COMMENTS_PATTERN = /^\/api\/articles\/[^/]+\/comments\/?$/;
const PUBLIC_ARTICLES_PATTERN = /^\/articles(?:\/.*)?$/;
const PUBLIC_API_PATTERN = /^\/api\/public(?:\/.*)?$/;

function isPublicRoute(pathname: string, method: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) {
    return true;
  }

  if (PUBLIC_COMMENTS_PATTERN.test(pathname) && (method === "GET" || method === "POST")) {
    return true;
  }

  if (PUBLIC_ARTICLES_PATTERN.test(pathname) && method === "GET") {
    return true;
  }

  if (PUBLIC_API_PATTERN.test(pathname) && (method === "GET" || method === "POST")) {
    return true;
  }

  return false;
}

function unauthorized(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname, request.method)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return unauthorized(request);
  }

  try {
    const payload = await verifyToken(token);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.userId));
    requestHeaders.set("x-user-role", String(payload.roleId));

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch {
    return unauthorized(request);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};

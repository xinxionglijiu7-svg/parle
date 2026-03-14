import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me",
);

const PUBLIC_PATHS = ["/", "/login", "/register", "/api/auth"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static files
  if (isPublicPath(pathname) || pathname.startsWith("/_next") || pathname.startsWith("/icons")) {
    return addSecurityHeaders(NextResponse.next());
  }

  // For API routes, let Hono middleware handle auth
  if (pathname.startsWith("/api/")) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Check for token in cookie
  const token = request.cookies.get("parle-token")?.value;

  if (!token) {
    return addSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return addSecurityHeaders(NextResponse.next());
  } catch {
    return addSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)"],
};

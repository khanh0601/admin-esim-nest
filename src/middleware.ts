import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const roleCookie = req.cookies.get("role")?.value;
  const role = roleCookie ? parseInt(roleCookie, 10) : null;

  const isLoggedIn = Boolean(token);
  const isAuthPage = req.nextUrl.pathname === "/login";
  const pathname = req.nextUrl.pathname;

  // Redirect to login if not authenticated (except login page)
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect authenticated users away from login page
  if (isLoggedIn && isAuthPage) {
    // Redirect based on role
    if (role === 1) {
      return NextResponse.redirect(new URL("/admin/announce", req.url));
    }
    return NextResponse.redirect(new URL("/admin/notice", req.url));
  }

  // Role-based route protection
  if (isLoggedIn && role !== null) {
    // Role = 1: Cannot access /admin/notice
    if (role === 1 && pathname === "/admin/notice") {
      return NextResponse.redirect(new URL("/admin/announce", req.url));
    }
    
    // Role = 0: Cannot access /admin/register
    if (role === 0 && pathname === "/admin/register") {
      return NextResponse.redirect(new URL("/admin/notice", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - Static files (images, fonts, icons, etc.)
     */
    "/((?!api|_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|css|js)$).*)",
  ],
};

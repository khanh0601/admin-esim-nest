import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const isLoggedIn = Boolean(token);
  const isAuthPage = req.nextUrl.pathname === "/login";

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/notice", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/notice", "/login", "/admin/:path*"],
};

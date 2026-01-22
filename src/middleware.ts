import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const pathname = req.nextUrl.pathname;

  // ✅ Allow admin login page always
  if (pathname === "/admin/login") {
    // If already logged in → go to admin home
    if (refreshToken) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // ✅ Protect all other admin routes
  if (pathname.startsWith("/admin") && !refreshToken) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

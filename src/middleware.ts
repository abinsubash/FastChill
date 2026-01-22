import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/admin/login") && refreshToken) {
    return NextResponse.redirect(
      new URL("/admin", req.url)
    );
  }

  if (pathname.startsWith("/admin") && !refreshToken) {
    return NextResponse.redirect(
      new URL("/admin/login", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

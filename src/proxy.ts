import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    // Login sahifasi ochiq
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const token = req.cookies.get("admin_token")?.value;
    const validToken = process.env.ADMIN_SECRET;

    if (!token || token !== validToken) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
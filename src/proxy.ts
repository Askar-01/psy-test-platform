import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "./lib/admin-session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    // Login sahifasi ochiq
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const token = req.cookies.get("admin_token")?.value;
    const valid = await verifyAdminSession(token);

    if (!valid) {
      const url = new URL("/admin/login", req.url);
      const res = NextResponse.redirect(url);
      // Eski yoki noto'g'ri tokenni darhol o'chiramiz
      if (token) res.cookies.delete("admin_token");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

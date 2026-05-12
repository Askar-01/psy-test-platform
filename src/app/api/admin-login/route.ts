import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createAdminSession,
  timingSafeEqualString,
} from "../../../lib/admin-session";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret) {
      return NextResponse.json(
        { error: "Server konfiguratsiya xatosi" },
        { status: 500 }
      );
    }

    // Parolni timing-safe solishtirish
    if (
      typeof password !== "string" ||
      !timingSafeEqualString(password, adminSecret)
    ) {
      return NextResponse.json({ error: "Parol noto'g'ri" }, { status: 401 });
    }

    // Imzolangan, muddati cheklangan session token
    const { token, maxAge } = await createAdminSession();

    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import {
  DASHBOARD_HOME,
  DASHBOARD_PREFIX,
  LOGIN_PATH,
} from "./config/private-routes";
import { AUTH_SECRET } from "./lib/auth-secret";

/**
 * Kabinet sessiyasiz ochilmaydi, kirib bo'lgan odam esa login sahifasini
 * ko'rmaydi. Bu faqat cookie bo'yicha tez saralash: JWT'ning backend
 * tomonidan qabul qilinishini kabinetdagi AuthGuard (`/auth/me`) tekshiradi.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = await getToken({ req: request, secret: AUTH_SECRET });
  const signedIn = Boolean(token?.accessToken) && !token?.error;

  if (pathname === DASHBOARD_PREFIX || pathname.startsWith(`${DASHBOARD_PREFIX}/`)) {
    if (signedIn) return NextResponse.next();
    const url = new URL(LOGIN_PATH, request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (pathname === LOGIN_PATH && signedIn) {
    const next = request.nextUrl.searchParams.get("next");
    const target =
      next && next.startsWith(`${DASHBOARD_PREFIX}/`) && !next.startsWith("//")
        ? next
        : DASHBOARD_HOME;
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/auth/login"],
};

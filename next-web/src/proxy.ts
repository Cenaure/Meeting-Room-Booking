import {NextRequest, NextResponse} from "next/server";
import {sign_in_route} from "@/lib/routes";
import COOKIE_BASE from "@/lib/auth/cookie-base";
import jwt from "jsonwebtoken";

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (!decoded?.exp) return true;
    return decoded.exp * 1000 < Date.now() + 10_000;
  } catch {
    return true;
  }
};

const refreshTokens = async (refreshToken: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_INTERNAL_API_URL}/auth/refresh`,
    {
      method: "GET",
      headers: {Cookie: `refresh_token=${refreshToken}`},
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error("Refresh failed");
  return res.json() as Promise<{ accessToken: string; refreshToken: string }>;
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();

  const isProtected = pathname.startsWith("/profile");
  if (!isProtected) return response;

  const cookies = request.cookies;
  let accessToken = cookies.get("access_token")?.value;
  const refreshToken = cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL(sign_in_route, request.url));
  }

  const needsRefresh = !accessToken || isTokenExpired(accessToken);
  if (needsRefresh) {
    try {
      const data = await refreshTokens(refreshToken);

      response.cookies.set("access_token", data.accessToken, {
        ...COOKIE_BASE,
        maxAge: 30 * 60,
      });
      response.cookies.set("refresh_token", data.refreshToken, {
        ...COOKIE_BASE,
        maxAge: 30 * 24 * 60 * 60,
      });
    } catch {
      const redirectResponse = NextResponse.redirect(
        new URL(sign_in_route, request.url),
      );
      redirectResponse.cookies.delete("access_token");
      redirectResponse.cookies.delete("refresh_token");
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: "/profile/:path*",
};
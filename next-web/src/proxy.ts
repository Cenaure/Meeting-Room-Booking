import {NextRequest, NextResponse} from "next/server";
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

export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) return NextResponse.next();

  const accessToken = request.cookies.get("access_token")?.value;
  if (accessToken && !isTokenExpired(accessToken)) return NextResponse.next();

  let data: { accessToken: string; refreshToken: string };
  try {
    data = await refreshTokens(refreshToken);
  } catch {
    const response = NextResponse.next();
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  request.cookies.set("access_token", data.accessToken);
  request.cookies.set("refresh_token", data.refreshToken);

  const response = NextResponse.next({request: {headers: request.headers}});

  response.cookies.set("access_token", data.accessToken, {
    ...COOKIE_BASE,
    maxAge: 30 * 60,
  });
  response.cookies.set("refresh_token", data.refreshToken, {
    ...COOKIE_BASE,
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
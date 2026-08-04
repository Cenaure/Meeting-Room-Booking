import {NextRequest, NextResponse} from "next/server";
import COOKIE_BASE from "@/lib/auth/cookie-base";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && !origin.includes(host)) {
    return NextResponse.json({error: "Forbidden"}, {status: 403});
  }

  const refreshToken = request.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({error: "No refresh token"}, {status: 401});
  }

  try {
    const apiRes = await fetch(
      `${process.env.NEXT_PUBLIC_INTERNAL_API_URL}/auth/refresh`,
      {
        method: "GET",
        headers: {Cookie: `refresh_token=${refreshToken}`},
        cache: "no-store",
      },
    );
    if (!apiRes.ok) {
      const response = NextResponse.json(
        {error: "Refresh failed"},
        {status: 401},
      );

      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      return response;
    }

    const data = await apiRes.json();
    const response = NextResponse.json(
      {accessToken: data.accessToken},
      {status: 200},
    );

    response.cookies.set("access_token", data.accessToken, {
      ...COOKIE_BASE,
      maxAge: 30 * 60,
    });
    response.cookies.set("refresh_token", data.refreshToken, {
      ...COOKIE_BASE,
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    return NextResponse.json({error: "Server error"}, {status: 500});
  }
}

import axios, {AxiosError, InternalAxiosRequestConfig} from "axios";
import {cookies} from "next/headers";
import COOKIE_BASE from "@/lib/auth/cookie-base";

export const API_URL = process.env.NEXT_PUBLIC_INTERNAL_API_URL;

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

async function refreshTokens(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    headers: {Cookie: `refresh_token=${refreshToken}`},
    cache: "no-store",
  });
  if (!res.ok) return null;

  const data = await res.json();

  try {
    cookieStore.set("access_token", data.accessToken, {
      ...COOKIE_BASE,
      maxAge: 30 * 60,
    });
    cookieStore.set("refresh_token", data.refreshToken, {
      ...COOKIE_BASE,
      maxAge: 30 * 24 * 60 * 60,
    });
  } catch {
  }

  return data.accessToken;
}

const createInstance = async () => {
  const cookieStore = await cookies();

  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieStore.toString(),
    },
  });

  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config as RetriableConfig | undefined;
      if (!original || error.response?.status !== 401 || original._retry) {
        return Promise.reject(error);
      }
      original._retry = true;

      const token = await refreshTokens();
      if (!token) return Promise.reject(error);

      original.headers.Cookie = `access_token=${token}`;
      return instance(original);
    },
  );

  return instance;
};

export default createInstance;
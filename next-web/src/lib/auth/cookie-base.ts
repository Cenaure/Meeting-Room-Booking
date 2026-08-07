const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  domain:
    process.env.NODE_ENV === "production"
      ? "." + process.env.NEXT_PUBLIC_DOMAIN
      : undefined,
};

export default COOKIE_BASE
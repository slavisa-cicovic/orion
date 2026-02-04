import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  if (!process.env.NEXT_PUBLIC_HOST_API) {
    return NextResponse.json({ error: "NEXT_PUBLIC_HOST_API is not set" }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_HOST_API.replace(/\/$/, "");
  const apiBase = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  const rememberMe = cookieStore.get("rememberMe")?.value === "1";
  const refreshMaxAgeSeconds = 30 * 24 * 60 * 60;
  if (!refreshToken) {
    return NextResponse.json({ error: "Missing refresh token" }, { status: 401 });
  }

  const res = await fetch(`${apiBase}/auth/refresh`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ refreshToken })
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  const response = NextResponse.json(data ?? {}, { status: res.status });

  if (res.ok && data?.refreshToken) {
    response.cookies.set("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: rememberMe ? refreshMaxAgeSeconds : undefined
    });
  }

  return response;
}

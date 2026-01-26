import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  if (!process.env.NEXT_PUBLIC_HOST_API) {
    return NextResponse.json({ error: "NEXT_PUBLIC_HOST_API is not set" }, { status: 500 });
  }

  const refreshToken = cookies().get("refreshToken")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "Missing refresh token" }, { status: 401 });
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_HOST_API}/auth/refresh`, {
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
      path: "/"
    });
  }

  return response;
}

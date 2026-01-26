import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  if (!process.env.NEXT_PUBLIC_HOST_API) {
    return NextResponse.json({ error: "NEXT_PUBLIC_HOST_API is not set" }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_HOST_API.replace(/\/$/, "");
  const apiBase = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
  const refreshToken = cookies().get("refreshToken")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "Missing refresh token" }, { status: 400 });
  }

  const res = await fetch(`${apiBase}/auth/logout`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ refreshToken })
  });

  const response =
    res.status === 204 ? new NextResponse(null, { status: res.status }) : NextResponse.json({}, { status: res.status });

  if (res.ok) {
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0
    });
  }

  return response;
}

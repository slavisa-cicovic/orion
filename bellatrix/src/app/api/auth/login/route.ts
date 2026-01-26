import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_HOST_API) {
    return NextResponse.json({ error: "NEXT_PUBLIC_HOST_API is not set" }, { status: 500 });
  }

  const body = await request.json();

  const res = await fetch(`${process.env.NEXT_PUBLIC_HOST_API}/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
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

// src/app/api/login/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  // ⚠️ Tài khoản cứng
  if (email === "whitetien@gmail.com" && password === "Admin123123@@") {
    // Giả lập token
    const response = NextResponse.json({ message: "Login success" });

    // Gắn token vào cookie (có thể là JWT thật nếu dùng backend)
    response.cookies.set("token", "mocked-token", {
      httpOnly: true,
      path: "/",
    });

    return response;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}

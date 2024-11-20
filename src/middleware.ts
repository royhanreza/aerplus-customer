import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const { pathname } = request.nextUrl;

  // Jika user di halaman login dan sudah ada token, redirect ke order
  if (pathname === "/login") {
    if (token) {
      return NextResponse.redirect(new URL("/my-order", request.url));
    }
    return NextResponse.next();
  }

  // Untuk path lain, cek token
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/order/:path*", "/address/:path*", "/my-order/:path*", "/login"],
};

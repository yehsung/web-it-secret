import { NextRequest, NextResponse } from "next/server"

const ADMIN_PATH = "/admin-dashboard-xyz123"
const LOGIN_PATH = "/admin-dashboard-xyz123/login"
const AUTH_COOKIE = "admin_auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 관리자 경로 보호 (로그인 페이지 제외)
  if (pathname.startsWith(ADMIN_PATH) && pathname !== LOGIN_PATH) {
    const authCookie = request.cookies.get(AUTH_COOKIE)

    if (!authCookie || authCookie.value !== "authenticated") {
      const loginUrl = new URL(LOGIN_PATH, request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin-dashboard-xyz123", "/admin-dashboard-xyz123/:path*"],
}

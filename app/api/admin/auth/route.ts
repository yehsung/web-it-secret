import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 })
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: "비밀번호가 틀렸습니다" }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set("admin_auth", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8시간
    path: "/",
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete("admin_auth")
  return response
}

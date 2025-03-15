import { NextRequest, NextResponse } from "next/server";

import { verifyAdminPassword } from "@/lib/verify-password";

/** Verifies an admin password and returns the admin name. */
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    if (!password) {
      return NextResponse.json(
        { error: "Password required" },
        { status: 400 }
      )
    }

    const adminName = await verifyAdminPassword(password)

    if (!adminName) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      adminName,
    })
  } catch (error) {
    console.error("Password verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
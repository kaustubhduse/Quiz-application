import { connectDB } from "@/lib/mongodb"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const db = await connectDB()

    const user = await db.collection("users").findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 401 }
          )
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    )

    const cookieStore = await cookies()
    cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    })

    cookieStore.set("curr_user", JSON.stringify({ username: user.username, email: user.email }), {
        httpOnly: false, 
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

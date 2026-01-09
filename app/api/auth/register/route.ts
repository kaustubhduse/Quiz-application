import { connectDB } from "@/lib/mongodb"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function POST(req: Request){
  try {
    const { username, email, password } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const db = await connectDB()

    const existingUser = await db.collection("users").findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      console.log("DEBUG: Registration failed. Conflict found in DB:", existingUser)
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await db.collection("users").insertOne({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    })

    const token = jwt.sign(
      { userId: result.insertedId, username, email },
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
    
    cookieStore.set("curr_user", JSON.stringify({ username, email }),{
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    })

    return NextResponse.json({ success: true })
  } 
  catch (error){
    console.error("Registration Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

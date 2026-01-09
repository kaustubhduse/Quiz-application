import { connectDB } from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const {searchParams} = new URL(req.url)
    const email = searchParams.get("email")

    if(!email){
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      )
    }

    const db = await connectDB()
    
    const attempts = await db.collection("submissions")
      .find({ email })
      .sort({ createdAt: -1 })
      .toArray()

    const history = attempts.map((a: any) => ({
      id: a._id,
      score: a.score || 0,
      totalQuestions: a.questions?.length || 15,
      date: a.createdAt || (a._id && new Date(parseInt(a._id.toString().substring(0, 8), 16) * 1000)) || new Date()
    }))

    return NextResponse.json({
        count: attempts.length,
        history
    })

  } 
  catch (error){
    console.error("Attempts Fetch Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

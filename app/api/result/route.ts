import { connectDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 })
  }

  const db = await connectDB()

  try{
    const submission = await db
      .collection("submissions")
      .findOne({ _id: new ObjectId(id) })

    if(!submission){
      return NextResponse.json({ error: "Not Found" }, { status: 404 })
    }

    return NextResponse.json(submission)
  } 
  catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }
}

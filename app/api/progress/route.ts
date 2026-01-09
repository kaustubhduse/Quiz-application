import { connectDB } from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function POST(req: Request){
  try{
      const data = await req.json()
      const db = await connectDB()

      if(!data.email){
          return NextResponse.json({ error: "Email required" }, { status: 400 })
      }

      await db.collection("progress").updateOne(
        { email: data.email },
        { 
            $set: {
                ...data,
                updatedAt: new Date()
            } 
        },
        { upsert: true }
      )

      return NextResponse.json({ success: true })
  } 
  catch (e){
      console.error("Progress Save Error", e)
      return NextResponse.json({ error: "Failed to save progress" }, { status: 500 })
  }
}

export async function GET(req: Request){
    try{
        const { searchParams } = new URL(req.url)
        const email = searchParams.get("email")

        if (!email){
            return NextResponse.json({ error: "Email required" }, { status: 400 })
        }

        const db = await connectDB()
        const progress = await db.collection("progress").findOne({ email })

        return NextResponse.json(progress || { empty: true })
    } 
    catch (e){
        console.error("Progress Fetch Error", e)
        return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
    }
}

export async function DELETE(req: Request){
    try {
        const { searchParams } = new URL(req.url)
        const email = searchParams.get("email")

        if (!email){
            return NextResponse.json({ error: "Email required" }, { status: 400 })
        }

        const db = await connectDB()
        await db.collection("progress").deleteOne({ email })

        return NextResponse.json({ success: true })
    } 
    catch (e){
        console.error("Progress Delete Error", e)
        return NextResponse.json({ error: "Failed to delete progress" }, { status: 500 })
    }
}

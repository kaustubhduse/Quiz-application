import { connectDB } from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()
  const db = await connectDB()

  const { questions, answers, ...restOfBody } = body

  let score = 0
  questions.forEach((q: any, i: number) => {
    const val = q.correct_answer || q.correctAnswer
    if(answers[i] === val){
      score++
    } 
  })
  console.log(`Final Score Calculated: ${score}`)

  const submission = {
    ...restOfBody,
    questions,
    answers,
    score,
    submittedAt: new Date(),
  }

  const result = await db.collection("submissions").insertOne(submission)
  await db.collection("progress").deleteOne({ email: body.email })

  return NextResponse.json({ success: true, id: result.insertedId })
}

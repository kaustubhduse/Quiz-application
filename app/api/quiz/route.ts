import { NextResponse } from "next/server"
import axios from "axios"
import { shuffle } from "@/lib/shuffle"

// Use global variable to persist cache across hot-reloads in dev
declare global {
    // eslint-disable-next-line no-var
    var _quizCache: { data: any; time: number } | undefined;
}

const CACHE_DURATION = 30 * 1000 // 30 seconds to be safe (API limit is 1 per 5s)

// Fallback data in case API is completely blocked
const FALLBACK_QUESTIONS = [
    {
        question: "What is the capital of France?",
        correct_answer: "Paris",
        incorrect_answers: ["London", "Berlin", "Madrid"],
        category: "Geography",
        difficulty: "easy"
    },
    {
        question: "Which language runs in a web browser?",
        correct_answer: "JavaScript",
        incorrect_answers: ["Java", "C", "Python"],
        category: "Computer Science",
        difficulty: "easy"
    },
    {
        question: "What does CSS stand for?",
        correct_answer: "Cascading Style Sheets",
        incorrect_answers: ["Central Style Sheets", "Cascading Simple Sheets", "Cars SUVs Sailboats"],
        category: "Computer Science",
        difficulty: "medium"
    },
    {
        question: "What does HTML stand for?",
        correct_answer: "Hypertext Markup Language",
        incorrect_answers: ["Hypertext Markdown Language", "Hyperloop Machine Language", "Helicopters Terminals Motorboats Lamborginis"],
        category: "Computer Science",
        difficulty: "easy"
    },
    {
        question: "What year was JavaScript launched?",
        correct_answer: "1995",
        incorrect_answers: ["1996", "1994", "None of the above"],
        category: "Computer Science",
        difficulty: "hard"
    }
    // We can add more if needed, but this prevents the 'crash'
];

export async function GET() {
  try {
    const now = Date.now()
    
    if(!global._quizCache){
        global._quizCache = { data: null, time: 0 }
    }

    if(global._quizCache.data && (now - global._quizCache.time < CACHE_DURATION)){
        return NextResponse.json(global._quizCache.data)
    }

    try {
        const apiUrl = process.env.OPENTDB_API_URL || "https://opentdb.com/api.php?amount=15&type=multiple"
        const res = await axios.get(apiUrl)
            
        if(res.data.response_code && res.data.response_code !== 0){
            throw new Error("OpenTDB API Error Code: " + res.data.response_code)
        }

        const questions = res.data.results.map((q: any) => ({
            question: q.question,
            options: shuffle([q.correct_answer, ...q.incorrect_answers]),
            correctAnswer: q.correct_answer,
            category: q.category,
            difficulty: q.difficulty
        }))

        global._quizCache = { data: questions, time: now }
        return NextResponse.json(questions)

    } 
    catch (apiError: any){
        if(global._quizCache.data){
             console.warn("API failed, serving stale cache", apiError.message)
             return NextResponse.json(global._quizCache.data)
        }
        console.warn("API failed and no cache, serving fallback", apiError.message)
        const fallbackQuestions = FALLBACK_QUESTIONS.map((q: any) => ({
            question: q.question,
            options: shuffle([q.correct_answer, ...q.incorrect_answers]),
            correctAnswer: q.correct_answer,
            category: q.category,
            difficulty: q.difficulty
        }))
        return NextResponse.json(fallbackQuestions)
    }
  } 
  catch (error: any){
    console.error("Critical error in quiz route:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

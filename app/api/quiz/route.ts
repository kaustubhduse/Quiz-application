import { NextResponse } from "next/server"
import axios from "axios"
import { shuffle } from "@/lib/shuffle"

declare global {
    var _quizCache: { data: any; time: number } | undefined;
}

const CACHE_DURATION = 30 * 1000
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
];

export async function GET() {
  try {
    const now = Date.now()
    
    if(!global._quizCache){
        global._quizCache = { data: null, time: 0 }
    }

    if(global._quizCache.data && (now - global._quizCache.time < CACHE_DURATION)){
        const shuffledQuestions = shuffle([...global._quizCache.data])
        return NextResponse.json(shuffledQuestions)
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
        const shuffledQuestions = shuffle([...questions])
        return NextResponse.json(shuffledQuestions)

    } 
    catch (apiError: any){
        if(global._quizCache.data){
             console.warn("API failed, serving stale cache", apiError.message)
             const shuffledQuestions = shuffle([...global._quizCache.data])
             return NextResponse.json(shuffledQuestions)
        }
        console.warn("API failed and no cache, serving fallback", apiError.message)
        const fallbackQuestions = FALLBACK_QUESTIONS.map((q: any) => ({
            question: q.question,
            options: shuffle([q.correct_answer, ...q.incorrect_answers]),
            correctAnswer: q.correct_answer,
            category: q.category,
            difficulty: q.difficulty
        }))
        const shuffledFallback = shuffle([...fallbackQuestions])
        return NextResponse.json(shuffledFallback)
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

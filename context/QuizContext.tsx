"use client"
import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

interface QuizContextType {
    questions: any[]
    answers: any[]
    index: number
    visited: Set<number>
    marked: Set<number>
    loading: boolean
    error: string | null
    isSidebarOpen: boolean
    userInfo: { username: string; email: string } | null
    initialTime: number
    handleTimeUpdate: (time: number) => void
    setIndex: (i: number | ((prev: number) => number)) => void
    setIsSidebarOpen: (v: boolean) => void
    handleOptionSelect: (opt: string) => void
    handleSaveAndNext: () => void
    handleClearResponse: () => void
    handleMarkForReviewNext: () => void
    submit: () => Promise<void>
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

export function QuizProvider({ children }: { children: ReactNode }) {
    const [questions, setQuestions] = useState<any[]>([])
    const [index, setIndex] = useState(0)
    const [answers, setAnswers] = useState<any[]>(Array(15).fill(null))
    const [visited, setVisited] = useState<Set<number>>(new Set([0]))
    const [marked, setMarked] = useState<Set<number>>(new Set())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [userInfo, setUserInfo] = useState<{username: string, email: string} | null>(null)
    const [initialTime, setInitialTime] = useState(1800)
    const [startTime, setStartTime] = useState<number>(Date.now())

    const answersRef = useRef(answers)
    const questionsRef = useRef(questions)
    const isSubmittedRef = useRef(false)
    const router = useRouter()

    useEffect(() => { answersRef.current = answers }, [answers])
    useEffect(() => { questionsRef.current = questions }, [questions])

    const getUserFromCookie = () => {
        const match = document.cookie.match(new RegExp('(^| )curr_user=([^;]+)'))
        if (match) {
            try {
                return JSON.parse(decodeURIComponent(match[2]))
            } catch (e) {
                return null
            }
        }
        return null
    }

    const fetchQuiz = async () => {
        const user = getUserFromCookie()
        if (!user) {
            router.push("/login")
            return
        }
        setUserInfo(user)

        setLoading(true)
        setError(null)

        try {
            const [quizRes, progressRes] = await Promise.all([
                axios.get("/api/quiz"),
                axios.get(`/api/progress?email=${user.email}`)
            ])

            const p = progressRes.data
            if (p && !p.empty) {
                // Restore questions if available (prevents shuffle on refresh)
                if (p.questions && p.questions.length > 0) {
                    setQuestions(p.questions)
                } else {
                    // LEGACY FIX: If progress exists but no questions (old data), 
                    // use fresh questions BUT save them immediately so they stick.
                    setQuestions(quizRes.data)
                    // Trigger immediate save to lock these questions
                    axios.post("/api/progress", {
                        email: user.email,
                        questions: quizRes.data,
                        answers: p.answers || Array(15).fill(null),
                        index: 0, // Reset to 0 as requested
                        visited: Array.from(p.visited ? new Set(p.visited) : new Set([0])),
                        marked: Array.from(p.marked ? new Set(p.marked) : new Set()),
                        startTime: p.startTime || Date.now(),
                    }).catch(console.error)
                }

                if (p.answers) setAnswers(p.answers)
                if (p.visited) setVisited(new Set(p.visited))
                if (p.marked) setMarked(new Set(p.marked))
                
                // USER REQUEST: "dont navigate to last save and next question"
                // We intentionally DO NOT restore the index, letting it default to 0 (Question 1)
                // if (p.index !== undefined) setIndex(p.index) 

                if (p.startTime) {
                    setStartTime(p.startTime)
                    const elapsed = Math.floor((Date.now() - p.startTime) / 1000)
                    const remaining = 1800 - elapsed
                    if (remaining <= 0) {
                        submit()
                        return
                    }
                    setInitialTime(remaining)
                } else {
                    const now = Date.now()
                    setStartTime(now)
                }
            } else {
                // Fresh start
                setQuestions(quizRes.data)
                const now = Date.now()
                setStartTime(now)
                setVisited(new Set([0]))
                
                // IMPACT: Save fresh questions immediately to prevent shuffle on next refresh
                 axios.post("/api/progress", {
                    email: user.email,
                    questions: quizRes.data,
                    answers: Array(15).fill(null),
                    index: 0,
                    visited: [0],
                    marked: [],
                    startTime: now,
                }).catch(console.error)
            }

            setLoading(false)

        } catch (err) {
            setLoading(false)
            if (axios.isAxiosError(err)) {
              if (err.response?.status === 429) {
                setError("Rate limit exceeded. Please try again in moments.")
              } else {
                setError(err.response?.data?.error || "Failed to load quiz.")
              }
            } else {
                setError("An unexpected error occurred.")
            }
        }
    }

    useEffect(() => {
        fetchQuiz()

        return () => {
            if (!isSubmittedRef.current && questionsRef.current.length > 0) {
               const u = getUserFromCookie()
               if (u) {
                 const payload = {
                    email: u.email,
                    questions: questionsRef.current,
                    answers: answersRef.current,
                 };
                 fetch("/api/submit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    keepalive: true,
                 }).catch(console.error)
               }
            }
        }
    }, [])

    useEffect(() => {
        if (!userInfo || loading) return

        const timerId = setTimeout(() => {
            axios.post("/api/progress", {
                email: userInfo.email,
                questions, // Save the questions to prevent shuffle on refresh
                answers,
                index,
                visited: Array.from(visited),
                marked: Array.from(marked),
                startTime,
            }).catch(console.error)
        }, 1000)

        return () => clearTimeout(timerId)
    }, [questions, answers, index, visited, marked, startTime, userInfo])
      
    useEffect(() => {
        setVisited((prev) => new Set(prev).add(index))
    }, [index])

    const handleOptionSelect = useCallback((opt: string) => {
        const copy = [...answers]
        copy[index] = opt
        setAnswers(copy)
    }, [answers, index])

    const handleSaveAndNext = useCallback(() => {
        if (index < questions.length - 1) setIndex(i => i + 1)
    }, [index, questions.length])

    const handleClearResponse = useCallback(() => {
        const copy = [...answers]
        copy[index] = null
        setAnswers(copy)
    }, [answers, index])

    const handleMarkForReviewNext = useCallback(() => {
        setMarked((prev) => new Set(prev).add(index))
        if (index < questions.length - 1) setIndex(i => i + 1)
    }, [index, questions.length])

    const submit = useCallback(async () => {
        if (isSubmittedRef.current || !userInfo) return;
        isSubmittedRef.current = true;
        setLoading(true) 
        
        try {
            const res = await axios.post("/api/submit", {
                email: userInfo.email,
                questions: questions,
                answers: answers,
            })
            router.push(`/result?id=${res.data.id}`)
        } 
        catch (e) {
            console.error(e)
            alert("Failed to submit. Please try again.")
            isSubmittedRef.current = false;
            setLoading(false)
        }
    }, [userInfo, questions, answers, router])

    const handleTimeUpdate = useCallback((time: number) => {
    }, [])

    return (
        <QuizContext.Provider value={{
            questions, answers, index, visited, marked, loading, error, isSidebarOpen, userInfo, initialTime, handleTimeUpdate,
            setIndex, setIsSidebarOpen, handleOptionSelect, handleSaveAndNext, handleClearResponse, handleMarkForReviewNext, submit
        }}>
            {children}
        </QuizContext.Provider>
    )
}

export function useQuiz() {
    const context = useContext(QuizContext)
    if (context === undefined) {
        throw new Error("useQuiz must be used within a QuizProvider")
    }
    return context
}

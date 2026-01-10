"use client"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import Timer from "@/components/Timer"
import QuestionCard from "@/components/QuestionCard"
import OverviewPanel from "@/components/OverviewPanel"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/LoadingSpinner"
import { Menu, X } from "lucide-react"

export default function Quiz() {
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

    const params = new URLSearchParams(window.location.search)
    const isFresh = params.get("fresh") === "true"

    setLoading(true)
    setError(null)

    try {
        if (isFresh) {
            await axios.delete(`/api/progress?email=${user.email}`)
        }

        const [quizRes, progressRes] = await Promise.all([
            axios.get("/api/quiz"),
            axios.get(`/api/progress?email=${user.email}`)
        ])

        setQuestions(quizRes.data)
        
        const p = progressRes.data
        if (p && !p.empty && !isFresh) {
            if (p.answers) setAnswers(p.answers)
            if (p.visited) setVisited(new Set(p.visited))
            if (p.marked) setMarked(new Set(p.marked))
            if (p.index !== undefined) setIndex(p.index)
            if (p.timeRemaining !== undefined) setInitialTime(p.timeRemaining)
        } 
        else {
            setVisited(new Set([0]))
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
            answers,
            index,
            visited: Array.from(visited),
            marked: Array.from(marked),
        }).catch(console.error)
    }, 1000)

    return () => clearTimeout(timerId)
  }, [answers, index, visited, marked, userInfo])
  
  useEffect(() => {
    setVisited((prev) => new Set(prev).add(index))
  }, [index])


  const handleOptionSelect = (opt: string) => {
    const copy = [...answers]
    copy[index] = opt
    setAnswers(copy)
  }

  const handleSaveAndNext = () => {
    if (index < questions.length - 1) setIndex(i => i + 1)
  }

  const handleClearResponse = () => {
    const copy = [...answers]
    copy[index] = null
    setAnswers(copy)
  }

  const handleMarkForReviewNext = () => {
    setMarked((prev) => new Set(prev).add(index))
    if (index < questions.length - 1) setIndex(i => i + 1)
  }

  const submit = async () => {
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
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="h-screen flex flex-col items-center justify-center p-8 text-red-500">{error}</div>
  if (!questions.length) return null

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden font-sans">
        <div className="bg-slate-900 text-white p-2 px-4 flex justify-between items-center h-16 shrink-0 z-30 shadow-md">
            <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
                 >
                    <Menu size={24} />
                 </button>
                 <h1 className="font-bold text-base md:text-lg leading-tight">
                    <span className="hidden md:inline">Premium Mock Test 2026</span>
                    <span className="md:hidden">Mock Test 2026</span>
                 </h1>
            </div>
            
            <div className="flex items-center gap-3 md:gap-4">
                 <span className="text-sm hidden md:inline text-slate-400 font-medium">Time Left:</span>
                 <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-emerald-400 font-mono font-bold text-lg shadow-inner">
                    <Timer initialTime={initialTime} onEnd={submit} /> 
                 </div>
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
            <div className="flex-1 flex flex-col overflow-hidden relative w-full">
                 <div className="flex-1 overflow-y-auto bg-slate-50">
                    <QuestionCard
                        {...questions[index]}
                        selected={answers[index]}
                        onSelect={handleOptionSelect}
                    />
                 </div>
                 <div className="z-20 border-t border-slate-200 bg-white p-3 md:px-6 md:py-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex flex-col md:flex-row gap-3 md:gap-0 items-center justify-between">
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={handleMarkForReviewNext} className="flex-1 md:flex-none bg-white border-2 border-slate-200 hover:border-purple-300 text-slate-600 hover:text-purple-600 font-bold py-2.5 px-4 rounded-xl text-xs md:text-sm transition-all whitespace-nowrap">
                            Mark for Review
                        </button>
                        <button onClick={handleClearResponse} className="flex-1 md:flex-none bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs md:text-sm transition-all">
                            Clear
                        </button>
                    </div>
                    <button 
                        onClick={() => index === questions.length - 1 ? submit() : handleSaveAndNext()}
                        className={`w-full md:w-auto font-bold py-3 px-8 rounded-xl text-sm shadow-lg transform active:scale-95 transition-all ${index === questions.length - 1 ? "bg-green-600 text-white hover:bg-green-700 shadow-green-500/30" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30"}`}
                    >
                         {index === questions.length - 1 ? "Submit Test" : "Save & Next"}
                    </button>
                 </div>
            </div>

            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className={`
                fixed inset-y-0 right-0 z-50 w-[85%] max-w-[320px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
                md:relative md:transform-none md:w-[30%] md:max-w-[350px] md:border-l md:border-slate-200 md:shadow-none
                ${isSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
            `}>
                <div className="h-full flex flex-col">
                    <div className="md:hidden p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                        <span className="font-bold text-slate-800">Question Palette</span>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                        <OverviewPanel 
                            answers={answers} 
                            setIndex={(i) => {
                                setIndex(i)
                                setIsSidebarOpen(false)
                            }}
                            visited={visited} 
                            marked={marked}
                            currentIndex={index}
                            username={userInfo?.username || "Candidate"}
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

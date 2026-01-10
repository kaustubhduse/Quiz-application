"use client"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "axios"
import { CheckCircle2, XCircle, MinusCircle, Home, RotateCcw, Award } from "lucide-react"

export default function Result() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get("id")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [totalAttempts, setTotalAttempts] = useState(0)

  useEffect(() => {
    if (id) {
      axios.get(`/api/result?id=${id}`).then((res) => {
        setResult(res.data)
        setLoading(false)
        if (res.data.email) {
            axios.get(`/api/attempts?email=${res.data.email}`).then(hist => {
                setTotalAttempts(hist.data.count || 1)
            })
        }
      }).catch(err => {
        console.error(err)
        setLoading(false)
        alert("Failed to load result")
      })
    }
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!result) return <div className="h-screen flex items-center justify-center text-red-500">Result not found</div>

  const { score, questions, answers } = result
  
  const displayScore = score !== undefined ? score : 0
  const totalQuestions = questions?.length || 15
  const percentage = Math.round((displayScore / totalQuestions) * 100)

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-6 overflow-hidden relative">
       {/* Background Ambient Glows */}
       <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow"></div>
       <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow animation-delay-2000"></div>

      <div className="max-w-5xl mx-auto relative z-10 space-y-8 pb-12">
        {/* Header Summary Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            <div className="flex flex-col items-center justify-center gap-8">
                {/* Text Stats */}
                <div className="text-center space-y-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-5xl font-bold text-white">Quiz Completed!</h1>
                        <p className="text-slate-400 text-lg">Great effort! Here is how you performed.</p>
                    </div>
                    
                    <div className="flex gap-4 mt-6 justify-center">
                         <div className="bg-white/5 p-6 rounded-2xl border border-white/5 min-w-[150px]">
                             <div className="text-4xl font-bold text-white mb-2">{displayScore} <span className="text-xl text-slate-500 font-normal">/ {totalQuestions}</span></div>
                             <div className="text-xs text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1"><Award size={14}/> Score</div>
                         </div>
                         <div className="bg-white/5 p-6 rounded-2xl border border-white/5 min-w-[150px]">
                             <div className="text-4xl font-bold text-white mb-2">#{totalAttempts}</div>
                             <div className="text-xs text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1"><RotateCcw size={14}/> Attempt</div>
                         </div>
                    </div>

                    <div className="flex gap-4 mt-8 justify-center">
                        <button 
                            onClick={() => router.push("/")}
                            className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/10"
                        >
                            <Home size={18} />
                            Return Home
                        </button>
                         <button 
                            onClick={() => router.push("/instructions?fresh=true")}
                            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-500 transition-colors flex items-center gap-2 shadow-lg shadow-purple-600/20 border border-purple-500"
                        >
                            <RotateCcw size={18} />
                            Re-attempt
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Detailed Analysis */}
        <div className="space-y-4 max-w-4xl mx-auto animate-fade-in-up animation-delay-500">
          <div className="flex items-center gap-4 px-4">
               <div className="h-px bg-white/10 flex-1"></div>
               <span className="text-slate-400 uppercase tracking-widest text-sm font-bold">Detailed Analysis</span>
               <div className="h-px bg-white/10 flex-1"></div>
          </div>

          {questions.map((q: any, i: number) => {
            const userAnswer = answers[i]
            const isCorrect = userAnswer === q.correctAnswer
            const isSkipped = userAnswer === null

            let statusIcon = <MinusCircle size={20} className="text-slate-400" />
            let statusColor = "border-slate-700 bg-slate-800/50"
            let textColor = "text-slate-400"
            let badgeText = "Skipped"

            if (!isSkipped) {
                if (isCorrect) {
                    statusIcon = <CheckCircle2 size={20} className="text-green-400" />
                    statusColor = "border-green-500/30 bg-green-500/10"
                    textColor = "text-green-400"
                    badgeText = "Correct"
                } else {
                    statusIcon = <XCircle size={20} className="text-red-400" />
                    statusColor = "border-red-500/30 bg-red-500/10"
                    textColor = "text-red-400"
                    badgeText = "Incorrect"
                }
            }

            return (
              <div key={i} className={`p-6 rounded-2xl border ${statusColor} backdrop-blur-sm transition-all hover:bg-white/5`}>
                <div className="flex justify-between items-start mb-4">
                    <span className="font-bold text-slate-500 text-sm uppercase tracking-wide">Question {i + 1}</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase flex items-center gap-1.5 border border-white/5 ${textColor} bg-white/5`}>
                        {statusIcon}
                        {badgeText}
                    </span>
                </div>
                
                <div className="text-lg md:text-xl font-medium text-slate-200 mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: q.question }} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className={`p-4 rounded-xl border ${isCorrect ? "bg-green-500/5 border-green-500/20" : isSkipped ? "bg-slate-800/50 border-slate-700" : "bg-red-500/5 border-red-500/20" }`}>
                        <span className="block text-slate-500 text-xs uppercase font-bold mb-2">Your Answer</span>
                        <div className={`font-medium text-lg ${isCorrect ? 'text-green-400' : isSkipped ? 'text-slate-400' : 'text-red-400'}`}>
                            {userAnswer ? <span dangerouslySetInnerHTML={{ __html: userAnswer }} /> : "Not Attempted"}
                        </div>
                    </div>
                    <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20">
                        <span className="block text-blue-400 text-xs uppercase font-bold mb-2">Correct Answer</span>
                        <div className="font-medium text-lg text-blue-300" dangerouslySetInnerHTML={{ __html: q.correctAnswer }} />
                    </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

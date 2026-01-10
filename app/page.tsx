"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "axios"
import { LogOut } from "lucide-react"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const getUserFromCookie = () => {
    const match = document.cookie.match(new RegExp('(^| )curr_user=([^;]+)'))
    if (match) {
        try { return JSON.parse(decodeURIComponent(match[2])) } catch(e){ return null }
    }
    return null
  }

  useEffect(() => {
    const user = getUserFromCookie()
    if (user) {
        setIsAuthenticated(true)
        fetchData(user.email)
    } else {
        setLoading(false)
    }
  }, [])

  const fetchData = async (email: string) => {
    try {
        const histRes = await axios.get(`/api/attempts?email=${email}`)
        setHistory(histRes.data.history || [])
    } catch (e) {
        console.error("Failed to fetch data", e)
    } finally {
        setLoading(false)
    }
  }

  const handleLogout = async () => {
    await axios.post("/api/auth/logout")
    setIsAuthenticated(false)
    setHistory([])
    router.push("/login")
  }

  const handleStart = () => {
    router.push("/instructions?fresh=true")
  }

  if (loading) return <LoadingSpinner />


  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-4 md:p-6 relative overflow-hidden font-sans">
      
      {isAuthenticated && (
          <div className="absolute top-6 right-6 z-20">
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 rounded-xl transition-colors text-sm font-medium"
            >
                <span className="text-slate-300">Logout</span>
                <LogOut size={16} className="text-slate-400" />
            </button>
          </div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-5xl space-y-16 py-12">
        <div className="text-center space-y-8 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
            Quiz by CausalFunnel
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                All your attempts are stored here. <br className="hidden md:block"/> You can attempt quiz multiple times
            </p>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center mt-10">
            {isAuthenticated ? (
                <button
                    onClick={handleStart}
                    className="flex flex-col items-center px-10 py-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors font-bold text-xl min-w-[240px]"
                >
                    <span>{history.length > 0 ? "Re-attempt Test" : "Start Exam"}</span>
                    {history.length > 0 && <span className="text-sm font-normal text-blue-200 mt-1">Start Fresh</span>}
                </button>
            ) : (
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push("/login")}
                        className="px-8 py-3 rounded-xl bg-white text-slate-900 font-bold text-lg hover:bg-slate-100 transition-colors"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => router.push("/signup")}
                        className="px-8 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-lg hover:bg-slate-700 transition-colors"
                    >
                        Sign Up
                    </button>
                </div>
            )}
            </div>
        </div>

        {isAuthenticated && history.length > 0 && (
            <div className="w-full max-w-4xl animate-fade-in-up animation-delay-500">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-2xl font-bold text-white">History</h3>
                    <span className="text-slate-400 text-sm font-medium">{history.length} Attempt{history.length !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto max-h-[260px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800">
                                <tr className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                                    <th className="py-4 pl-6">Date</th>
                                    <th className="py-4">Score</th>
                                    <th className="py-4 text-right pr-6">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-200 divide-y divide-white/5">
                                {history.map((attempt) => (
                                    <tr key={attempt.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="py-4 pl-6 text-sm font-medium">
                                            {attempt.date ? new Date(attempt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString()}
                                            <span className="block text-xs text-slate-500 font-normal mt-0.5">
                                                {attempt.date ? new Date(attempt.date).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'}) : ''}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-bold text-white">{attempt.score}</span>
                                                <span className="text-xs text-slate-500">/ {attempt.totalQuestions}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-right pr-6">
                                            <button 
                                                onClick={() => router.push(`/result?id=${attempt.id}`)}
                                                className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 border border-indigo-500/20 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                                            >
                                                View Report
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
      </div>
      
      <div className="absolute bottom-6 text-xs text-slate-500 font-medium">
        © 2026 Kaustubh Duse
      </div>
    </div>
  )
}

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col items-center p-4 md:p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow animation-delay-2000"></div>

      {isAuthenticated && (
          <div className="absolute top-6 right-6 z-20">
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-full backdrop-blur-md transition-all text-sm font-medium hover:shadow-lg hover:shadow-purple-500/20 group"
            >

                <span className="text-gray-300 group-hover:text-white transition-colors">Logout</span>
                <LogOut size={16} className="text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-5xl space-y-16 py-12">
        <div className="text-center space-y-8 animate-fade-in-up">
            <div className="inline-block relative">
                 <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 drop-shadow-2xl">
                    Quiz by CausalFunnel
                 </h1>
                 <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 blur-2xl opacity-20 rounded-full -z-10"></div>
            </div>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
                All your attempts are stored here. <br className="hidden md:block"/> You can attempt quiz multiple times
            </p>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center mt-10">
            {isAuthenticated ? (
                <button
                    onClick={handleStart}
                    className="group relative px-8 py-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 min-w-[200px] overflow-hidden"
                >
                        <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors"></div>
                        <div className="relative flex flex-col items-center">
                        <span className="text-xl font-bold tracking-tight text-white">
                            {history.length > 0 ? "Re-attempt Test" : "Start Exam"}
                        </span>
                        {history.length > 0 && <span className="text-xs font-medium uppercase tracking-wider mt-1 text-emerald-100">Start Fresh</span>}
                        </div>
                </button>
            ) : (
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push("/login")}
                        className="px-10 py-4 rounded-2xl bg-white text-slate-900 font-bold text-lg shadow-xl shadow-white/10 hover:shadow-white/20 hover:bg-slate-50 transform hover:-translate-y-1 transition-all duration-300"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => router.push("/signup")}
                        className="px-10 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold text-lg hover:bg-white/10 transform hover:-translate-y-1 transition-all duration-300"
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
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-8 bg-purple-500 rounded-full"></span>
                        History
                    </h3>
                    <span className="text-slate-400 text-sm font-medium">{history.length} Attempt{history.length !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-1 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto max-h-[260px] overflow-y-auto custom-scrollbar rounded-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-md z-10 shadow-sm">
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

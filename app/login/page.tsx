"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try{
      await axios.post("/api/auth/login", { email, password })
      router.push("/")
      router.refresh()
    } 
    catch (err: any){
      setError(err.response?.data?.error || "Login failed")
      setLoading(false)
    } 
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold text-center text-white">Welcome Back</h2>
        
        {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded text-sm text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? <LoadingSpinner fullScreen={false} /> : "Login"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}

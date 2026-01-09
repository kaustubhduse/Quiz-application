"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function Signup() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await axios.post("/api/auth/register", { username, email, password })
      router.push("/")
      router.refresh()
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold text-center text-white">Create Account</h2>
        
        {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded text-sm text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/20 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-500"
              placeholder="Choose a username"
            />
          </div>
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
              placeholder="Create a strong password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? <LoadingSpinner fullScreen={false} /> : "Sign Up"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

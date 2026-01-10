"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CheckCircle2, AlertCircle, Clock, FileText, ChevronRight } from "lucide-react"

export default function Instructions() {
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)

  const handleStart = () => {
    if (accepted) {
        const params = new URLSearchParams(window.location.search)
        const isFresh = params.get("fresh") === "true"
        router.push(isFresh ? "/quiz?fresh=true" : "/quiz")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
         <div className="flex-1 p-8 md:p-10 text-slate-800">
            <h1 className="text-3xl font-extrabold mb-2 text-slate-900">Quiz Instructions</h1>
            <p className="text-slate-500 mb-8 font-medium">Please read carefully before proceeding.</p>

            <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-green-600 mt-1 shrink-0" />
                    <span className="text-slate-700 leading-relaxed">The quiz consists of <strong>15 questions</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-green-600 mt-1 shrink-0" />
                    <span className="text-slate-700 leading-relaxed">You have <strong>30 minutes</strong> to complete the quiz.</span>
                </li>
                <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-green-600 mt-1 shrink-0" />
                    <span className="text-slate-700 leading-relaxed">Questions can be <strong>marked for review</strong> and revisited.</span>
                </li>
                <li className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-orange-500 mt-1 shrink-0 px-0" />
                    <span className="text-slate-700 leading-relaxed">The quiz <strong>auto-submits</strong> when the timer reaches zero.</span>
                </li>
            </ul>

            <div className="space-y-6">
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors select-none">
                    <input 
                        type="checkbox" 
                        checked={accepted} 
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm font-medium text-slate-700">I have read and understood the instructions.</span>
                </label>

                <button
                    onClick={handleStart}
                    disabled={!accepted}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1 shadow-xl shadow-slate-900/10"
                >
                    Start Examination
                    <ChevronRight size={20} />
                </button>
            </div>
         </div>
      </div>
    </div>
  )
}

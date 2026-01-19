"use client"
import Timer from "@/components/Timer"
import QuestionCard from "@/components/QuestionCard"
import LoadingSpinner from "@/components/LoadingSpinner"
import { Menu, X } from "lucide-react"
import { QuizProvider, useQuiz } from "@/context/QuizContext"
import dynamic from "next/dynamic"

const OverviewPanel = dynamic(() => import("@/components/OverviewPanel"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><LoadingSpinner fullScreen={false} /></div>
})

function QuizContent() {
  const { 
      questions, index, answers, loading, error, isSidebarOpen, setIsSidebarOpen,
      initialTime, submit, handleOptionSelect, handleMarkForReviewNext, handleClearResponse, 
      handleSaveAndNext, handleTimeUpdate
  } = useQuiz()

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
                    <Timer initialTime={initialTime} onEnd={submit} onTimeUpdate={handleTimeUpdate} /> 
                 </div>
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
            <div className="flex-1 flex flex-col overflow-hidden relative w-full">
                 <div className="flex-1 overflow-y-auto bg-slate-50">
                    <QuestionCard />
                 </div>
                 <div className="z-20 border-t border-slate-200 bg-white p-3 md:px-6 md:py-4 shrink-0 flex flex-col md:flex-row gap-3 md:gap-0 items-center justify-between">
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={handleMarkForReviewNext} className="flex-1 md:flex-none bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 font-semibold py-2.5 px-4 rounded-xl text-xs md:text-sm transition-colors whitespace-nowrap">
                            Mark for Review
                        </button>
                        <button onClick={handleClearResponse} className="flex-1 md:flex-none bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 font-semibold py-2.5 px-4 rounded-xl text-xs md:text-sm transition-colors">
                            Clear
                        </button>
                    </div>
                    <button 
                        onClick={() => index === questions.length - 1 ? submit() : handleSaveAndNext()}
                        className={`w-full md:w-auto font-bold py-3 px-8 rounded-xl text-sm transition-colors ${index === questions.length - 1 ? "bg-green-600 text-white hover:bg-green-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}
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
                        <OverviewPanel />
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default function Quiz() {
    return (
        <QuizProvider>
            <QuizContent />
        </QuizProvider>
    )
}

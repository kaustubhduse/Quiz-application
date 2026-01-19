import { useQuiz } from "@/context/QuizContext"
import { memo, useCallback } from "react"

function QuestionCard() {
    const { questions, index, answers, handleOptionSelect } = useQuiz()
    const currentQuestion = questions[index]
    
    if (!currentQuestion) return null

    const { question, options, category, difficulty } = currentQuestion
    const selected = answers[index]
    const onSelect = handleOptionSelect

    const getDifficultyColor = useCallback((diff: string) => {
        switch(diff?.toLowerCase()) {
            case 'easy': return 'bg-green-100 text-green-700 border-green-200'
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'hard': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-gray-100 text-gray-700'
        }
    }, [])

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      {/* Header Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getDifficultyColor(difficulty)}`}>
            {difficulty || "General"}
        </span>
        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold uppercase tracking-wide">
            {category || "General"}
        </span>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-serif text-slate-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: question }} />
      </div>

      {/* Options */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {options?.map((ans: string, i: number) => (
            <button
                key={i}
                onClick={() => onSelect(ans)}
                className={`w-full text-left p-4 rounded-xl border transition-colors flex items-center gap-4
                ${selected === ans 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-slate-200 hover:bg-slate-50"
                }`}
            >
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 text-sm font-bold
                    ${selected === ans ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300 text-slate-500"}
                `}>
                    {String.fromCharCode(65 + i)}
                </div>
                <span className={`text-base md:text-lg ${selected === ans ? "text-blue-900 font-medium" : "text-slate-700"}`} dangerouslySetInnerHTML={{ __html: ans }} />
            </button>
        ))}
      </div>
    </div>
  )
}

export default memo(QuestionCard)

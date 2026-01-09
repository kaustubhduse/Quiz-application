
interface QuestionCardProps {
    question: string
    options: string[]
    selected?: string | null
    onSelect: (answer: string) => void
    category: string
    difficulty: string
}

export default function QuestionCard({ question, options, selected, onSelect, category, difficulty }: QuestionCardProps) {
    const getDifficultyColor = (diff: string) => {
        switch(diff?.toLowerCase()) {
            case 'easy': return 'bg-green-100 text-green-700 border-green-200'
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'hard': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

  return (
    <div className="p-8 h-full flex flex-col">
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
        {options?.map((ans, i) => (
            <button
                key={i}
                onClick={() => onSelect(ans)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group hover:shadow-md
                ${selected === ans 
                    ? "border-blue-500 bg-blue-50/50" 
                    : "border-gray-100 bg-white hover:border-blue-300 hover:bg-blue-50/30"
                }`}
            >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors font-bold text-sm
                    ${selected === ans ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 text-gray-400 group-hover:border-blue-400 group-hover:text-blue-500"}
                `}>
                    {String.fromCharCode(65 + i)}
                </div>
                <span className={`text-base md:text-lg ${selected === ans ? "text-blue-900 font-medium" : "text-slate-600"}`} dangerouslySetInnerHTML={{ __html: ans }} />
            </button>
        ))}
      </div>
    </div>
  )
}

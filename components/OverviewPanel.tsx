import { User, Circle, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { useQuiz } from "@/context/QuizContext";
import { memo, useMemo } from "react";

function OverviewPanel() {
  const { answers, setIndex, visited, marked, index: currentIndex, userInfo, setIsSidebarOpen } = useQuiz();
  const username = userInfo?.username || "Candidate";

  const stats = useMemo(() => {
    const answeredCount = answers.filter((a) => a !== null).length;
    const notAnsweredCount = visited.size - answeredCount;
    const notVisitedCount = 15 - visited.size;
    const markedCount = marked.size;
    const markedAndAnsweredCount = answers.filter((a, i) => a !== null && marked.has(i)).length;
    
    return { answeredCount, notAnsweredCount, notVisitedCount, markedCount, markedAndAnsweredCount };
  }, [answers, visited, marked]);

  return (
    <div className="bg-white h-full flex flex-col font-sans">
      <div className="p-6 border-b border-gray-100 bg-slate-50 flex items-center gap-4">
        <div className="bg-blue-100 p-3 rounded-full shadow-sm text-blue-600">
            <User size={24} />
        </div>
        <div>
            <div className="font-bold text-slate-800 text-lg">{username || "Candidate"}</div>
            <div className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded-full inline-block mt-1">Student</div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-2 gap-4 text-xs border-b border-gray-100">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                <Circle size={18} />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-700 leading-none">{stats.notVisitedCount}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide mt-1">Not Visited</span>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100/50 text-red-500 border border-red-200 flex items-center justify-center shadow-sm shrink-0">
                <AlertCircle size={18} />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-700 leading-none">{stats.notAnsweredCount}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide mt-1">Not Answered</span>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100/50 text-green-500 border border-green-200 flex items-center justify-center shadow-sm shrink-0">
                <CheckCircle2 size={18} />
            </div>
             <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-700 leading-none">{stats.answeredCount}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide mt-1">Answered</span>
             </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100/50 text-purple-500 border border-purple-200 flex items-center justify-center shadow-sm shrink-0">
                <HelpCircle size={18} />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-700 leading-none">{stats.markedCount}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide mt-1">Marked</span>
             </div>
        </div>
      </div>

            {/* Question Grid header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-gray-100">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Question Palette</h3>
            </div>

            {/* Scrollable Questions */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="grid grid-cols-4 gap-3">
                {answers.map((a: any, i: number) => {
                    const isAnswered = a !== null;
                    const isMarked = marked.has(i);
                    const isVisited = visited.has(i);
                    
                    let btnClass = "bg-white border border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-600"; 
                    
                    if(!isVisited){
                        btnClass = "bg-slate-50 border border-slate-200 text-slate-300";
                    } 
                    else if(isAnswered){
                        btnClass = "bg-green-500 border border-green-600 text-white"; 
                    } 
                    else if(isMarked){
                        btnClass = "bg-purple-500 border border-purple-600 text-white";
                    } 
                    else{
                        btnClass = "bg-red-50 border border-red-200 text-red-500";
                    }

                    const isCurrent = currentIndex === i;

                    return (
                    <button
                        key={i}
                        onClick={() => {
                            setIndex(i);
                            setIsSidebarOpen(false);
                        }}
                        className={`
                            relative w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all
                            ${btnClass}
                            ${isCurrent ? "ring-2 ring-blue-500 z-10" : "hover:bg-slate-50"}
                        `}
                    >
                        {i + 1}
                        {isMarked && isAnswered && (
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full border-2 border-white text-[8px] w-4 h-4 flex items-center justify-center">
                        <CheckCircle2 size={8} className="text-white"/>
                    </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default memo(OverviewPanel)

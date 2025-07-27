import { ArrowRight } from "lucide-react"
import React from "react"

type SolutionCardProps = {
  item: {
    id: string
    style: string
    icon: React.ReactNode
    title: string
    description: string
  }
  isActive: boolean
}

function SolutionCard({ item, isActive }: SolutionCardProps) {
  return (
    <div className={`p-4 rounded-xl border ${isActive ? "border-emerald-200" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.style}`}>
            {item.icon}
          </div>
          <div>
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-dark/60 font-normal leading-tight">{item.description}</p>
          </div>
        </div>
        <div className="ml-auto">
          {isActive ? (
            <div className="relative flex items-center cursor-not-allowed">
              <div className="w-10 h-6 rounded-full opacity-50 bg-emerald-400" />
              <div className="absolute left-5 w-4 h-4 rounded-full shadow bg-light" />
            </div>
          ) : (
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-accent text-accent hover:bg-accent hover:text-light">
              Contratar
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(SolutionCard)
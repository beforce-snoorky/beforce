"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"

const GaugeComponent = dynamic(() => import("react-gauge-component"), { ssr: false, loading: () => <SkeletonGauge /> })

function SkeletonGauge() {
  return (
    <div className="relative w-full max-w-lg flex flex-col items-center justify-center animate-pulse min-h-32 xl:min-h-54 p-4">
      <svg className="w-full h-32 xl:h-54" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
        <path d="M10,100 A90,90 0 0,1 190,100" fill="none" stroke="#e5e7eb" strokeWidth="20" strokeLinecap="round" />
        <text x="100" y="90" textAnchor="middle" fontSize="48" fill="#d1d5db" dominantBaseline="middle">--</text>
      </svg>
    </div>
  )
}

export default function DigitalScoreGauge({ score }: { score: number }) {
  const [showLabel, setShowLabel] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setShowLabel(true), 500)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <GaugeComponent
      type="semicircle"
      arc={{
        width: 0.1, padding: 0.02, cornerRadius: 16,
        subArcs: [
          { limit: 25, color: '#EF4444', tooltip: { text: 'Potencial Inexplorado' } },
          { limit: 50, color: '#F59E0B', tooltip: { text: 'Progresso Inicial' } },
          { limit: 75, color: '#EAB308', tooltip: { text: 'Bom Desenvolvimento' } },
          { color: '#10B981', tooltip: { text: 'Excelente Progresso' } },
        ],
      }}
      pointer={{ color: '#1F2937', length: 0.8, width: 12 }}
      labels={{ valueLabel: { hide: true } }}
      minValue={0}
      maxValue={100}
      value={score}
    />
  )
}
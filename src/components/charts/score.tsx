"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"

const GaugeComponent = dynamic(() => import("react-gauge-component"), { ssr: false })

export default function DigitalScoreGauge({ score }: { score: number }) {
  const [showGauge, setShowGauge] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setShowGauge(true), 300)
    return () => clearTimeout(timeout)
  }, [])

  if (!showGauge) {
    return (
      <div className="relative w-full max-w-lg flex flex-col items-center justify-center animate-pulse min-h-[200px] p-4">
        <svg className="w-full h-54" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
          <path d="M10,100 A90,90 0 0,1 190,100" fill="none" stroke="#e5e7eb" strokeWidth="20" strokeLinecap="round" />
        </svg>
        <div className="absolute bottom-10 h-10 w-32 rounded-xl bg-gray-300" />
      </div>
    )
  }

  return (
    <GaugeComponent
      type="semicircle"
      arc={{
        width: 0.1,
        padding: 0.02,
        cornerRadius: 16,
        subArcs: [
          {
            limit: 25,
            color: '#EF4444',
            tooltip: { text: 'Potencial Inexplorado' },
          },
          {
            limit: 50,
            color: '#F59E0B',
            tooltip: { text: 'Progresso Inicial' },
          },
          {
            limit: 75,
            color: '#EAB308',
            tooltip: { text: 'Bom Desenvolvimento' },
          },
          {
            color: '#10B981',
            tooltip: { text: 'Excelente Progresso' },
          },
        ],
      }}
      pointer={{
        color: '#1F2937',
        length: 0.8,
        width: 12,
        type: "arrow"
      }}
      labels={{
        valueLabel: {
          formatTextValue: (val) => `${val}%`,
          style: { fontSize: 48, fill: "#1F2937" },
        },
      }}
      minValue={0}
      maxValue={100}
      value={score}
    />
  )
}

"use client"

import dynamic from "next/dynamic"
const GaugeComponent = dynamic(() => import("react-gauge-component"), { ssr: false })

export default function DigitalScoreGauge({ score }: { score: number }) {
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

"use client"

import { useAuth } from "@/context/authContext"
import { calculateScore } from "@/utils/calculateScore"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import type { EChartsOption } from "echarts-for-react"

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false })

function getMessage(score: number) {
  if (score >= 100) return "Parabéns! Você ativou todas as soluções digitais disponíveis."
  if (score >= 75) return "Falta pouco! Continue contratando soluções para atingir o nível máximo."
  if (score >= 50) return "Bom progresso! Continue crescendo."
  return "Você está só começando. Há muito espaço para crescimento com as soluções BEFORCE!"
}

export function DigitalScoreGauge() {
  const { company } = useAuth()
  const [height, setHeight] = useState(150)

  useEffect(() => {
    function updateHeight() {
      const width = window.innerWidth
      if (width >= 1280) setHeight(275)
      else if (width >= 1024) setHeight(275)
      else if (width >= 768) setHeight(275)
      else setHeight(150)
    }

    updateHeight()
    window.addEventListener("resize", updateHeight)
    return () => window.removeEventListener("resize", updateHeight)
  }, [])

  if (!company) return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <div className="animate-spin size-8 mr-2 rounded-full border-4 border-accent-light border-r-accent" />
    </div>
  )

  const { score, activeCount, total } = calculateScore(company)
  const gaugeValue = Math.min(Math.max(score, 0), 100)

  const option: EChartsOption = {
    series: [{
      type: "gauge",
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      center: ["50%", "75%"],
      radius: "150%",
      splitNumber: 0,
      axisLine: {
        lineStyle: {
          width: 16,
          color: [[0.25, "#EF4444"], [0.5, "#F59E0B"], [0.75, "#EAB308"], [1, "#10B981"]],
          shadowColor: "rgba(0,138,255,0.45)",
          shadowBlur: 0,
        },
        roundCap: true,
      },
      pointer: {
        length: "75%",
        width: 8,
        offsetCenter: [0, "5%"],
        itemStyle: {
          color: "#fa0d1d"
        }
      },
      progress: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      title: { show: false },
      detail: { show: false },
      data: [{ value: gaugeValue }]
    }]
  }

  return (
    <div className="p-4 rounded-xl border border-surface bg-light">
      <h2 className="text-lg font-semibold">Pontuação Digital</h2>
      <div className="max-w-xl mx-auto">
        <div className="w-full max-w-4xl mx-auto mt-6 px-4">
          <ReactECharts
            option={option}
            notMerge={true}
            lazyUpdate={true}
            style={{ width: "100%", height }}
          />
        </div>
        <div className="text-center">
          <p className="text-sm leading-relaxed text-dark/75">
            Você ativou <strong className="font-semibold text-dark">{activeCount}</strong> de <strong className="font-semibold text-dark">{total}</strong> soluções digitais disponíveis.
          </p>
          <p className="text-xs text-dark/50">
            {getMessage(score)}
          </p>
        </div>
      </div>
    </div>
  )
}
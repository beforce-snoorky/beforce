"use client"

import { useSession } from "@/hooks/useSession"
import { calculateScore } from "@/utils/calculateScore"
import GaugeComponent from "react-gauge-component"

function getMessage(score: number) {
  if (score >= 100) return "Parabéns! Você ativou todas as soluções digitais disponíveis."
  if (score >= 75) return "Falta pouco! Continue contratando soluções para atingir o nível máximo."
  if (score >= 50) return "Bom progresso! Continue crescendo."
  return "Você está só começando. Há muito espaço para crescimento com as soluções BEFORCE!"
}

export default function DigitalScoreGauge() {
  const { session, loading, error } = useSession()
  const company = session?.company

  if (error) return <p>Erro ao carregar dados: {error}</p>
  if (!company || loading) return <SkeletonGauge />

  const { score, activeCount, total } = calculateScore(company)

  return (
    <>
      <div className="max-w-xl mx-auto min-h-32 xl:min-h-56">
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
      </div>
      <div className="text-center">
        <p className="text-sm leading-relaxed text-dark/75">
          Você ativou <strong className="font-semibold text-dark">{activeCount}</strong> de <strong className="font-semibold text-dark">{total}</strong> soluções digitais disponíveis.
        </p>
        <p className="text-xs text-dark/50">
          {getMessage(score)}
        </p>
      </div>
    </>
  )
}

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
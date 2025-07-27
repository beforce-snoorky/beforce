import DigitalScoreGauge from "@/components/charts/score"
import Card from "@/components/ui/cards"
import { SolutionCard } from "@/components/ui/solutionsCard"
import { getServerSession } from "@/context/auth"
import { getDigitalScore } from "@/utils/calculateScore"
import { Gauge } from "lucide-react"

export default async function DashboardPage() {
  const { company } = await getServerSession()
  const { score, activeCount, total } = getDigitalScore(company)

  const getMessage = (percentage: number) => {
    if (percentage >= 100) {
      return "Parabéns! Você ativou todas as soluções digitais disponíveis."
    } else if (percentage >= 75) {
      return "Falta pouco! Continue contratando soluções para atingir o nível máximo."
    } else if (percentage >= 50) {
      return "Falta pouco! Continue contratando soluções para atingir o nível máximo."
    } else {
      return "Você está só começando. Há muito espaço para crescimento com as soluções BEFORCE!"
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-1 md">
        <Gauge className="w-6 h-6 text-accent" />
        <h1 className="text-xl md:text-2xl font-bold">Seu Score Digital</h1>
      </div>
      <p className="text-sm">Descubra como está sua transformação digital</p>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold">Pontuação Digital</h2>
          <div className="max-w-xl mx-auto min-h-32 xl:min-h-56">
            <DigitalScoreGauge score={score} />
          </div>
          <div className="text-center">
            <p className="text-sm leading-relaxed text-dark/75">
              Você ativou <strong className="font-semibold text-dark">{activeCount}</strong> de <strong className="font-semibold text-dark">{total}</strong> soluções digitais disponíveis.
            </p>
            <p className="text-xs text-dark/50">
              {getMessage(score)}
            </p>
          </div>
        </Card>
      </section>

      <section>
        <Card>
          <h2 className="text-lg font-semibold">
            {activeCount == total ? "Seus serviços contratados" : "Vamos ajudar você a alcançar mais pontos"}
          </h2>
          <SolutionCard
            active={{
              website: company.has_website ?? false,
              email_corp: company.has_email_corp ?? false,
              cloud_server: company.has_cloud_server ?? false,
              management_system: company.has_management_system ?? false,
              whatsapp: company.has_whatsapp ?? false,
              ia: company.has_ia ?? false,
              marketing: company.has_mkt_digital ?? false
            }}
          />
        </Card>
      </section>
    </>
  )
}
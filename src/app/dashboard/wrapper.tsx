import { getServerSession } from "@/context/auth"
import { calculateScore } from "@/utils/calculateScore"
import Card from "../../components/ui/cards"
import DigitalScoreGauge from "../../components/charts/score"
import { SolutionCard } from "../../components/ui/solutionsCard"

export default async function DashboardDataWrapper() {
  const { company } = await getServerSession()
  const { score, activeCount, total } = calculateScore(company)

  const allActive = activeCount === total

  return (
    <>
      <DigitalScoreGauge
        score={score}
        activeCount={activeCount}
        total={total}
      />

      <section>
        <Card>
          <h2 className="text-lg font-semibold">
            {allActive ? "Seus serviços contratados" : "Vamos ajudar você a alcançar mais pontos"}
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

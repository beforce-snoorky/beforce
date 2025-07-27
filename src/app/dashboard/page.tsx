import { Gauge } from "lucide-react"
import Card from "@/components/ui/cards"
import DigitalScoreGauge from "@/components/charts/score"
import { SolutionCard } from "@/components/ui/solutionsCard"

export default function DashboardPage() {
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
            <DigitalScoreGauge />
          </div>
        </Card>
      </section>

      <section>
        <Card>
          <h2 className="text-lg font-semibold">Seus serviços contratados</h2>
          <SolutionCard />
        </Card>
      </section>
    </>
  )
}
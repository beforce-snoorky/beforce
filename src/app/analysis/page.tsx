import DigitalScoreGauge from "@/components/charts/score"
import { SolutionsButton } from "@/components/solutions"
import Card from "@/components/ui/cards"
import { solutions } from "@/constants/solutions"
import { Gauge } from "lucide-react"

export default function DashboardPage() {
  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <Gauge className="w-6 h-6 text-accent" />
        <h1 className="text-xl md:text-2xl font-bold">Seu Score Digital</h1>
      </div>
      <p className="text-sm">Descubra como está sua transformação digital</p>

      <Card>
        <h2 className="text-lg font-semibold">Pontuação Digital</h2>
        <div className="max-w-xl mx-auto">
          <DigitalScoreGauge />
        </div>
      </Card>

      <section>
        <Card>
          <h2 className="text-lg font-semibold">Seus serviços contratados</h2>
          <div className="flex flex-col gap-3 mt-4 md:mt-6">
            {solutions.map((item, index) => (
              <div key={index} className="p-4 rounded-xl border border-surface">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.style}`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-dark/60 leading-tight">{item.description}</p>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <SolutionsButton item={item.key} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  )
}
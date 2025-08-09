import { DigitalScoreGauge } from "@/components/charts/score"
import { SolutionsButton } from "@/components/solutions"
import { Card } from "@/components/ui/cards"
import { Icon } from "@/components/ui/icon"
import { solutions } from "@/constants/solutions"
import { Gauge } from "lucide-react"

export default function DashboardPage() {
  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <Gauge className="size-6 text-accent" />
        <h1 className="text-xl md:text-2xl font-bold">Seu Score Digital</h1>
      </div>
      <p className="text-sm">Descubra como está sua transformação digital</p>

      <DigitalScoreGauge />

      <section>
        <Card>
          <h2 className="text-lg font-semibold">Seus serviços contratados</h2>
          <div className="flex flex-col gap-3 mt-4 md:mt-6">
            {solutions.map((item, index) => (
              <div key={index} className="p-4 rounded-xl border border-surface bg-light">
                <div className="flex justify-between gap-2">
                  <div className="space-y-2 md:space-y-0 md:flex md:items-center md:gap-2">
                    <Icon icon={item.icon} style={item.style} />
                    <div>
                      <h3 className="font-medium">{item.label}</h3>
                      <p className="text-sm leading-tight text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <SolutionsButton item={item.key} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  )
}
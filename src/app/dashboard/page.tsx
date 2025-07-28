import { Brain, Cloud, Gauge, Globe2, Mail, MessageCircleMore, MonitorSmartphone, Server } from "lucide-react"
import Card from "@/components/ui/cards"
import DigitalScoreGauge from "@/components/charts/score"
import { Prefetch } from "@/components/prefetch"
import { SolutionsButton } from "@/components/ui/solutionsButton"

export default function DashboardPage() {
  const solutions = [
    { id: "website", style: "bg-purple-100 text-purple-600", icon: <Globe2 className="w-5 h-5" />, title: "Site Profissional", description: "Aumente sua presença online com um domínio profissional." },
    { id: "email_corp", style: "bg-emerald-100 text-emerald-600", icon: <Mail className="w-5 h-5" />, title: "Email Corporativo", description: "Reforce a credibilidade da sua marca com um e-mail profissional." },
    { id: "cloud_server", style: "bg-sky-100 text-sky-600", icon: <Cloud className="w-5 h-5" />, title: "Servidor em Nuvem", description: "Proteja e acesse seus dados com segurança, de onde estiver." },
    { id: "management_system", style: "bg-amber-100 text-amber-600", icon: <Server className="w-5 h-5" />, title: "Sistema de Gestão", description: "Organize processos e tome decisões com base em dados." },
    { id: "digisac", style: "bg-fuchsia-100 text-fuchsia-600", icon: <MessageCircleMore className="w-5 h-5" />, title: "WhatsApp Business", description: "Facilite a comunicação com seus clientes em tempo real." },
    { id: "ia", style: "bg-rose-100 text-rose-600", icon: <Brain className="w-5 h-5" />, title: "Inteligência Artificial", description: "Automatize tarefas e ganhe eficiência com soluções inteligentes." },
    { id: "marketing", style: "bg-cyan-100 text-cyan-600", icon: <MonitorSmartphone className="w-5 h-5" />, title: "Marketing Digital", description: "Atraia mais clientes com campanhas online bem direcionadas." },
  ]

  return (
    <>
      <Prefetch />

      <div className="flex items-center gap-2 mb-1 md">
        <Gauge className="w-6 h-6 text-accent" />
        <h1 className="text-xl md:text-2xl font-bold">Seu Score Digital</h1>
      </div>
      <p className="text-sm">Descubra como está sua transformação digital</p>

      <section className="grid grid-cols-1 gap-6">
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
          <div className="flex flex-col gap-3 mt-4 md:mt-6">
            {solutions.map((item, index) => (
              <div key={index} className="p-4 rounded-xl border border-surface">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.style}`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-dark/60 leading-tight">{item.description}</p>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <SolutionsButton item={item.id} />
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
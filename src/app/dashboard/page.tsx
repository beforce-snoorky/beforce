import DigitalScoreGauge from "@/components/charts/score"
import Card from "@/components/ui/cards"
import Solutions from "@/components/ui/solutionsCard"
import { getServerSession } from "@/context/auth"
import { getDigitalScore } from "@/utils/calculateScore"
import { Brain, Cloud, Gauge, Globe2, Mail, MessageCircleMore, MonitorSmartphone, Server } from "lucide-react"

const solutions = [
  { id: "website", style: "bg-purple-100 text-purple-600", icon: <Globe2 className="w-5 h-5" />, title: "Site Profissional", description: "Aumente sua presença online com um domínio profissional." },
  { id: "email_corp", style: "bg-emerald-100 text-emerald-600", icon: <Mail className="w-5 h-5" />, title: "Email Corporativo", description: "Reforce a credibilidade da sua marca com um e-mail profissional." },
  { id: "cloud_server", style: "bg-sky-100 text-sky-600", icon: <Cloud className="w-5 h-5" />, title: "Servidor em Nuvem", description: "Proteja e acesse seus dados com segurança, de onde estiver." },
  { id: "management_system", style: "bg-amber-100 text-amber-600", icon: <Server className="w-5 h-5" />, title: "Sistema de Gestão", description: "Organize processos e tome decisões com base em dados." },
  { id: "whatsapp", style: "bg-fuchsia-100 text-fuchsia-600", icon: <MessageCircleMore className="w-5 h-5" />, title: "WhatsApp Business", description: "Facilite a comunicação com seus clientes em tempo real." },
  { id: "ia", style: "bg-rose-100 text-rose-600", icon: <Brain className="w-5 h-5" />, title: "Inteligência Artificial", description: "Automatize tarefas e ganhe eficiência com soluções inteligentes." },
  { id: "marketing", style: "bg-cyan-100 text-cyan-600", icon: <MonitorSmartphone className="w-5 h-5" />, title: "Marketing Digital", description: "Atraia mais clientes com campanhas online bem direcionadas." },
]

export default async function DashboardPage() {
  const { company } = await getServerSession()
  const { score, activeCount, total } = getDigitalScore(company)

  const solutionsWithActive = solutions.map((item) => {
    const activeFlags = {
      website: company.has_website,
      email_corp: company.has_email_corp,
      cloud_server: company.has_cloud_server,
      management_system: company.has_management_system,
      whatsapp: company.has_whatsapp,
      ia: company.has_ia,
      marketing: company.has_mkt_digital
    }

    return {
      ...item,
      isActive: activeFlags[item.id as keyof typeof activeFlags]
    }
  })

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
          <div className="flex flex-col gap-3 mt-4 md:mt-6">
            {solutionsWithActive.map(({ isActive, ...item }) => (
              <Solutions key={item.id} item={item} isActive={isActive} />
            ))}
          </div>
        </Card>
      </section>
    </>
  )
}
import { ArrowRight, Brain, Cloud, Globe2, Mail, MessageCircleMore, MonitorSmartphone, Server } from "lucide-react"
import Link from "next/link"
import { SolutionCardButton } from "./solutionCardButton"

const solutions = [
  { id: "website", style: "bg-purple-100 text-purple-600", icon: <Globe2 className="w-5 h-5" />, title: "Site Profissional", description: "Aumente sua presença online com um domínio profissional." },
  { id: "email_corp", style: "bg-emerald-100 text-emerald-600", icon: <Mail className="w-5 h-5" />, title: "Email Corporativo", description: "Reforce a credibilidade da sua marca com um e-mail profissional." },
  { id: "cloud_server", style: "bg-sky-100 text-sky-600", icon: <Cloud className="w-5 h-5" />, title: "Servidor em Nuvem", description: "Proteja e acesse seus dados com segurança, de onde estiver." },
  { id: "management_system", style: "bg-amber-100 text-amber-600", icon: <Server className="w-5 h-5" />, title: "Sistema de Gestão", description: "Organize processos e tome decisões com base em dados." },
  { id: "whatsapp", style: "bg-fuchsia-100 text-fuchsia-600", icon: <MessageCircleMore className="w-5 h-5" />, title: "WhatsApp Business", description: "Facilite a comunicação com seus clientes em tempo real." },
  { id: "ia", style: "bg-rose-100 text-rose-600", icon: <Brain className="w-5 h-5" />, title: "Inteligência Artificial", description: "Automatize tarefas e ganhe eficiência com soluções inteligentes." },
  { id: "marketing", style: "bg-cyan-100 text-cyan-600", icon: <MonitorSmartphone className="w-5 h-5" />, title: "Marketing Digital", description: "Atraia mais clientes com campanhas online bem direcionadas." },
]

export function SolutionCard() {
  return (
    <div className="flex flex-col gap-3 mt-4 md:mt-6">
      {solutions.map((item) => (
        <div key={item.id} className="p-4 rounded-xl border border-surface">
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
              <SolutionCardButton item={item.id} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
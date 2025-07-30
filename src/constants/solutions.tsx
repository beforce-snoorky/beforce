import { Globe2, Mail, Cloud, MessageCircleMore, Brain, MonitorSmartphone, Server } from "lucide-react";

export const solutions = [
  { key: "has_website", style: "bg-purple-100 text-purple-600", label: "Site Corporativo", icon: <Globe2 className="w-5 h-5" />, description: "Aumente sua presença online com um domínio profissional." },
  { key: "has_email_corporate", style: "bg-emerald-100 text-emerald-600", label: "Email Corporativo", icon: <Mail className="w-5 h-5" />, description: "Reforce a credibilidade da sua marca com um e-mail profissional." },
  { key: "has_cloud_server", style: "bg-sky-100 text-sky-600", label: "Servidor em Nuvem", icon: <Cloud className="w-5 h-5" />, description: "Proteja e acesse seus dados com segurança, de onde estiver." },
  { key: "has_management_system", style: "bg-amber-100 text-amber-600", label: "Sistema de Gestão", icon: <Server className="w-5 h-5" />, description: "Organize processos e tome decisões com base em dados." },
  { key: "has_digisac", style: "bg-fuchsia-100 text-fuchsia-600", label: "WhatsApp Business", icon: <MessageCircleMore className="w-5 h-5" />, description: "Facilite a comunicação com seus clientes em tempo real." },
  { key: "has_ia", style: "bg-rose-100 text-rose-600", label: "Automações", icon: <Brain className="w-5 h-5" />, description: "Automatize tarefas e ganhe eficiência com soluções inteligentes." },
  { key: "has_marketing", style: "bg-cyan-100 text-cyan-600", label: "Marketing Digital", icon: <MonitorSmartphone className="w-5 h-5" />, description: "Atraia mais clientes com campanhas online bem direcionadas." },
] as const

export type SolutionKey = typeof solutions[number]["key"]
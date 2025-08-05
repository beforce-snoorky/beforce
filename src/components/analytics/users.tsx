import { UsersData, } from "@/types/analytics"
import Card from "../ui/cards"
import { UserCheck, UserPlus, Timer } from "lucide-react"

export function UsersStatistics({ users }: { users: UsersData }) {
  const performanceMetrics = [
    { label: "Total de Usuários", style: "text-accent bg-accent-light", icon: <UserCheck className="w-5 h-5" />, value: users.totalUsers },
    { label: "Novos Usuários", style: "text-blue-600 bg-blue-100", icon: <UserPlus className="w-5 h-5" />, value: users.newUsers },
    { label: "Tempo por sessão", style: "text-purple-600 bg-purple-100", icon: <Timer className="w-5 h-5" />, value: users.averageSessionDuration }
  ]

  return (
    <>
      {performanceMetrics.map((metric, index) => (
        <div key={index} className="cols-span-1 last:col-span-2">
          <Card style={metric.style}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 bg-light/75`}>
                {metric.icon}
              </div>
              <span className="text-xl font-bold">{metric.value}</span>
            </div>
            <span className="text-sm text-dark/75">{metric.label}</span>
          </Card>
        </div>
      ))}
    </>
  )
}
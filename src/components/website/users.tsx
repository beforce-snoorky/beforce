import type { UsersData } from "@/types/website"
import { MousePointerClick, Timer, UserCheck, UserPlus } from "lucide-react"

export function UsersStatistics({ users }: { users: UsersData }) {
  const metrics = [
    { label: "Total de Usuários", style: "text-blue-600 bg-blue-100", icon: <UserCheck className="size-5" />, value: users.totalUsers },
    { label: "Novos Usuários", style: "text-green-600 bg-green-100", icon: <UserPlus className="size-5" />, value: users.newUsers },
    { label: "Tempo por sessão", style: "text-purple-600 bg-purple-100", icon: <Timer className="size-5" />, value: users.averageSessionDuration },
    { label: "Taxa de Retenção", style: "text-pink-600 bg-pink-100", icon: <MousePointerClick className="size-5" />, value: users.engagementRate }
  ]

  return (
    <>
      {metrics.map((metric, index) => (
        <div key={index} className="col-span-4 md:col-span-2 p-4 rounded-xl border border-surface bg-light">
          <div className="flex max-lg:flex-col justify-between lg:items-center lg:gap-4">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-1">
                <div className={`size-8 rounded-lg flex items-center justify-center ${metric.style}`}>
                  {metric.icon}
                </div>
                <span className="text-xl font-medium text-gray-900">{metric.value}</span>
              </div>
              <span className="text-sm text-gray-500 whitespace-nowrap">{metric.label}</span>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
"use client"

import { useMediaQuery } from "@/hooks/useMediaQuery"
import { CityData } from "@/types/website"
import { ChevronDown, MapPin, MousePointerClick, UserPlus, UsersRound } from "lucide-react"
import { useState } from "react"
import { Card } from "../ui/cards"

export default function CitiesStatistics({ cities }: { cities: CityData[] | undefined }) {
  const isMobile = useMediaQuery("(max-width: 1079px)")
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  const toggleExpand = (key: string) => setExpandedKey(prev => (prev === key ? null : key))

  if (!cities || cities.length === 0) {
    return (
      <div className="md:hidden flex items-center justify-center min-h-40">
        <p className="text-sm text-dark/50">Nenhum dado encontrado.</p>
      </div>
    )
  }

  if (isMobile) return (
    <div className="col-span-8 md:col-span-4 p-4 rounded-xl border border-surface bg-light">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent" />
          <h2 className="text-md font-medium">Cidades com Mais Acessos</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Distribuição de acessos por localização</p>

        {cities.map((city, index) => {
          const isExpanded = expandedKey === city.city

          return (
            <Card key={index}>
              <div className="flex items-center justify-between" onClick={() => toggleExpand(city.city)}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm leading-tight truncate max-w-52">{city.city}</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sky-600 bg-sky-100">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <span className="text-xs">Novos Usuários</span>
                    </div>
                    <span className="font-medium">{city.newUsers}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-600 bg-emerald-100">
                        <UsersRound className="w-4 h-4" />
                      </div>
                      <span className="text-xs">Usuários Ativos</span>
                    </div>
                    <span className="font-medium">{city.activeUsers}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-violet-600 bg-violet-100">
                        <MousePointerClick className="w-4 h-4" />
                      </div>
                      <span className="text-xs">Sessões Engajadas</span>
                    </div>
                    <span className="font-medium">{city.engagedSessions}</span>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )

  return (
    <section className="col-span-3 flex flex-col">
      <div className="overflow-auto max-h-103 xl:max-h-full rounded-xl border border-surface bg-light">
        <div className="min-w-full">
          <div className="max-h-103 xl:max-h-max overflow-y-auto bg-light">
            <table className="w-full table-fixed divide-y divide-surface">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-start text-xs font-medium uppercase max-lg:w-40 lg:w-24 text-gray-500">Cidade</th>
                  <th className="py-3 px-4 text-start text-xs font-medium uppercase w-14 text-gray-500">Usuários</th>
                  <th className="py-3 px-4 text-start text-xs font-medium uppercase w-16 text-gray-500">Sessões</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cities.map((city, index) => (
                  <tr key={index} className="even:bg-gray-100">
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="truncate w-40 max-w-40 block">{city.city}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm w-14 text-gray-800">{Number(city.newUsers) + Number(city.activeUsers)}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm w-16 text-gray-800">{city.engagedSessions}</td>
                  </tr>
                )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
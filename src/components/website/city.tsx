"use client"

import { useMediaQuery } from "@/hooks/useMediaQuery"
import type { CityData } from "@/types/website"
import { ChevronDown, MapPin, MousePointerClick, UserPlus, UsersRound } from "lucide-react"
import { useState } from "react"
import { Table, TableBody, TableDataCell, TableHead, TableHeaderCell, TableRow } from "../ui/table"
import { Icon } from "../ui/icon"

export function CitiesStatistics({ cities }: { cities: CityData[] | undefined }) {
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
          <MapPin className="size-5 text-accent" />
          <h2 className="text-md font-medium">Cidades com Mais Acessos</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Distribuição de acessos por localização</p>

        {cities.map((city, index) => {
          const isExpanded = expandedKey === city.city

          return (
            <div className="p-4 rounded-xl border border-surface bg-light" key={index}>
              <div className="flex items-center justify-between" onClick={() => toggleExpand(city.city)}>
                <div className="flex items-center gap-2">
                  <Icon icon={<MapPin className="size-4" />} />
                  <span className="text-sm leading-tight truncate max-w-52">{city.city}</span>
                </div>
                <ChevronDown className={`size-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon icon={<UserPlus className="size-4" />} style="text-sky-600 bg-sky-100" />
                      <span className="text-xs">Novos Usuários</span>
                    </div>
                    <span className="font-medium">{city.newUsers}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon icon={<UsersRound className="size-4" />} style="text-emerald-600 bg-emerald-100" />
                      <span className="text-xs">Usuários Ativos</span>
                    </div>
                    <span className="font-medium">{city.activeUsers}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon icon={<MousePointerClick className="size-4" />} style="text-violet-600 bg-violet-100" />
                      <span className="text-xs">Sessões Engajadas</span>
                    </div>
                    <span className="font-medium">{city.engagedSessions}</span>
                  </div>
                </div>
              )}
            </div>
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
            <Table style="w-full table-fixed">
              <TableHead>
                <TableRow>
                  <TableHeaderCell style="max-lg:w-40 lg:w-24">Cidade</TableHeaderCell>
                  <TableHeaderCell style="w-14">Usuários</TableHeaderCell>
                  <TableHeaderCell style="w-16">Sessões</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cities.map((city, index) => (
                  <TableRow key={index} style="even:bg-gray-100">
                    <TableDataCell style="flex items-center gap-2">
                      <Icon icon={<MapPin className="size-4" />} />
                      <span className="truncate w-40 max-w-40 block">{city.city}</span>
                    </TableDataCell>
                    <TableDataCell style="w-14">{Number(city.newUsers) + Number(city.activeUsers)}</TableDataCell>
                    <TableDataCell style="w-16">{city.engagedSessions}</TableDataCell>
                  </TableRow>
                )
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  )
}
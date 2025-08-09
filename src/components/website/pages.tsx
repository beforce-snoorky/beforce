"use client"

import { useMediaQuery } from "@/hooks/useMediaQuery"
import { PageData } from "@/types/website"
import { BarChart2, ChevronDown, ExternalLink, Eye, FileText, UsersRound } from "lucide-react"
import { useState } from "react"
import { Card } from "../ui/cards"
import Link from "next/link"

export default function PagesStatistics({ site, pages }: { site: string, pages: PageData[] | undefined }) {
  const isMobile = useMediaQuery("(max-width: 1079px)")
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  const toggleExpand = (key: string) => setExpandedKey(prev => (prev === key ? null : key))

  if (!pages || pages.length === 0) {
    return (
      <div className="md:hidden flex items-center justify-center min-h-40">
        <p className="text-sm text-dark/50">Nenhum dado encontrado.</p>
      </div>
    )
  }

  if (isMobile)
    return (
      <div className="col-span-8 md:col-span-4 p-4 rounded-xl border border-surface bg-light">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            <h2 className="text-md font-medium">Páginas Visualizadas</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">Distribuição de páginas mais acessadas</p>

          {pages.map((page, index) => {
            const isExpanded = expandedKey === page.pagePath

            return (
              <Card key={index}>
                <div className="flex items-center justify-between" onClick={() => toggleExpand(page.pagePath)}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col max-w-52 truncate">
                      <Link href={`https://${site}${page.pagePath}`} className="text-xs leading-tight truncate">{page.pagePath}</Link>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sky-600 bg-sky-100">
                          <UsersRound className="w-4 h-4" />
                        </div>
                        <span className="text-xs">Usuários ativos</span>
                      </div>
                      <span className="font-medium">{page.activeUsers}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-600 bg-emerald-100">
                          <Eye className="w-4 h-4" />
                        </div>
                        <span className="text-xs">Visualizações</span>
                      </div>
                      <span className="font-medium">{page.screenPageViews}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-violet-600 bg-violet-100">
                          <BarChart2 className="w-4 h-4" />
                        </div>
                        <span className="text-xs">Visualizações por usuário</span>
                      </div>
                      <span className="font-medium">{Number(page.screenPageViewsPerUser).toFixed(2)}%</span>
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
    <section className="col-span-8 flex flex-col">
      <div className="overflow-auto max-h-103 rounded-xl border border-surface bg-light">
        <div className="min-w-full">
          <div className="max-h-103 overflow-y-auto bg-light">
            <table className="w-full table-fixed divide-y divide-surface">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-start text-xs font-medium uppercase w-48 text-gray-500">Página</th>
                  <th className="py-3 px-4 text-start text-xs font-medium uppercase w-8 text-gray-500">Usuários</th>
                  <th className="py-3 px-4 text-start text-xs font-medium uppercase w-10 text-gray-500">Visualizações</th>
                  <th className="py-3 px-4 text-start text-xs font-medium uppercase w-10 text-gray-500">Média Sessões</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pages.map((page, index) => (
                  <tr key={index} className="even:bg-gray-100">
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                        <FileText className="w-4 h-4" />
                      </div>
                      <Link href={`https://${site}${page.pagePath}`} className="truncate w-48 max-w-48 block">{page.pagePath}</Link>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm w-8 text-gray-800">{page.activeUsers}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm w-10 text-gray-800">{page.screenPageViews}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm w-10 text-gray-800">{Number(page.screenPageViewsPerUser).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
"use client"

import { useMediaQuery } from "@/hooks/useMediaQuery"
import type { PageData } from "@/types/website"
import { BarChart2, ChevronDown, ExternalLink, Eye, FileText, UsersRound } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableDataCell, TableHead, TableHeaderCell, TableRow } from "../ui/table"
import { Icon } from "../ui/icon"

export function PagesStatistics({ site, pages }: { site: string, pages: PageData[] | undefined }) {
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
            <FileText className="size-5 text-accent" />
            <h2 className="text-md font-medium">Páginas Visualizadas</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">Distribuição de páginas mais acessadas</p>

          {pages.map((page, index) => {
            const isExpanded = expandedKey === page.pagePath

            return (
              <div className="p-4 rounded-xl border border-surface bg-light" key={index}>
                <div className="flex items-center justify-between" onClick={() => toggleExpand(page.pagePath)}>
                  <div className="flex items-center gap-2">
                    <Icon icon={<ExternalLink className="size-4" />} />
                    <div className="flex flex-col max-w-52 truncate">
                      <Link href={`https://${site}${page.pagePath}`} className="text-xs leading-tight truncate">{page.pagePath}</Link>
                    </div>
                  </div>
                  <ChevronDown className={`size-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon icon={<UsersRound className="size-4" />} style="text-sky-600 bg-sky-100" />
                        <span className="text-xs">Usuários ativos</span>
                      </div>
                      <span className="font-medium">{page.activeUsers}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon icon={<Eye className="size-4" />} style="text-emerald-600 bg-emerald-100" />
                        <span className="text-xs">Visualizações</span>
                      </div>
                      <span className="font-medium">{page.screenPageViews}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon icon={<BarChart2 className="size-4" />} style="text-violet-600 bg-violet-100" />
                        <span className="text-xs">Visualizações por usuário</span>
                      </div>
                      <span className="font-medium">{Number(page.screenPageViewsPerUser).toFixed(2)}%</span>
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
    <section className="col-span-8 flex flex-col">
      <div className="overflow-auto max-h-103 rounded-xl border border-surface bg-light">
        <div className="min-w-full">
          <div className="max-h-103 overflow-y-auto bg-light">
            <Table style="w-full table-fixed">
              <TableHead>
                <TableRow>
                  <TableHeaderCell style="w-48">Página</TableHeaderCell>
                  <TableHeaderCell style="w-8">Usuários</TableHeaderCell>
                  <TableHeaderCell style="w-10">Visualizações</TableHeaderCell>
                  <TableHeaderCell style="w-10">Média Sessões</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pages.map((page, index) => (
                  <TableRow key={index} style="even:bg-gray-100">
                    <TableDataCell style="flex items-center gap-2">
                      <Icon icon={<FileText className="size-4" />} />
                      <Link href={`https://${site}${page.pagePath}`} className="truncate w-48 max-w-48 block">{page.pagePath}</Link>
                    </TableDataCell>
                    <TableDataCell style="w-8">{page.activeUsers}</TableDataCell>
                    <TableDataCell style="w-10">{page.screenPageViews}</TableDataCell>
                    <TableDataCell style="w-10">{Number(page.screenPageViewsPerUser).toFixed(2)}</TableDataCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  )
}
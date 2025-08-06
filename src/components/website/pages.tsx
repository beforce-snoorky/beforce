import { PageData } from "@/types/website"
import { FileText } from "lucide-react"
import Link from "next/link"

export default function TopPagesTable({ site, pages }: { site: string, pages: PageData[] | undefined }) {
  if (!pages || pages.length === 0) return null

  const metrics = [
    { key: "screenPageViews", label: "Visualizações" },
    { key: "screenPageViewsPerUser", label: "Visualizações por Usuário" },
  ]

  return (
    <section className="order-4 md:order-5 lg:order-6 xl:order-5 md:col-span-2 lg:col-span-3 xl:col-span-2 w-full">
      <div className="w-full overflow-auto max-h-129 relative rounded-xl border border-surface bg-light">
        <table className="min-w-max w-full">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              <th className="px-3 py-3 text-sm font-medium text-left">Página</th>
              <th className="px-3 py-3 text-sm font-medium text-center">Usuários</th>
              {metrics.map((m) => (
                <th key={m.key} className="px-3 py-3 text-sm font-medium text-center">{m.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pages.map((page, index) => (
              <tr key={index} className="border-b last:border-none border-surface even:bg-dark/3">
                <td className="px-3 py-3 text-sm flex items-center gap-2 max-w-xs">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                    <FileText className="w-4 h-4" />
                  </div>
                  <Link href={`https://${site}${page.pagePath}`} className="truncate max-w-56 md:max-w-60 block">{page.pagePath}</Link>
                </td>
                <td className="px-3 py-3 text-sm text-center">{page.activeUsers}</td>
                <td className="px-3 py-3 text-sm text-center">{page.screenPageViews}</td>
                <td className="px-3 py-3 text-sm text-center">{Number(page.screenPageViewsPerUser).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
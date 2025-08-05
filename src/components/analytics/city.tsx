import { CityData } from "@/types/analytics"
import { MapPin } from "lucide-react"

export default function TopCitiesTable({ cities }: { cities: CityData[] | undefined }) {
  if (!cities || cities.length === 0) return null

  return (
    <section className="order-5 md:order-6 lg:order-5 xl:order-6 md:col-span-2 xl:col-span-1 w-full">
      <div className="w-full overflow-auto max-h-129 relative rounded-xl border border-surface bg-light">
        <table className="min-w-max w-full">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              <th className="px-3 py-3 text-sm font-medium text-left">Cidade</th>
              <th className="px-3 py-3 text-sm font-medium text-center">Novos Usuários</th>
              <th className="px-3 py-3 text-sm font-medium text-center">Usuários Ativos</th>
              <th className="px-3 py-3 text-sm font-medium text-center">Sessões Engajadas</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city, index) => (
              <tr key={index} className="border-b last:border-none border-surface even:bg-dark/3">
                <td className="px-3 py-3 text-sm flex items-center gap-2 max-w-xs">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="truncate max-w-56 md:max-w-60 block">{city.city}</span>
                </td>
                <td className="px-3 py-3 text-sm text-center">{city.newUsers}</td>
                <td className="px-3 py-3 text-sm text-center">{city.activeUsers}</td>
                <td className="px-3 py-3 text-sm text-center">{city.engagedSessions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
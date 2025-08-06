// "use client"

// import TopCitiesTable from "@/components/website/city"
// import UsersByDevice from "@/components/website/devices"
// import LanguageGroupedChart from "@/components/website/languages"
// import SessionsByOrigin from "@/components/website/origem"
// import TopPagesTable from "@/components/website/pages"
// import UsersBySystem from "@/components/website/system"
// import { UsersStatistics } from "@/components/website/users"
// import Card from "@/components/ui/cards"
// import { useWebsiteReports } from "@/hooks/useWebsite"
// import { useAuth } from "@/hooks/useAuth"
// import { useReportFilter } from "@/hooks/useFilterContext"
// import { Globe2, ExternalLink } from "lucide-react"
// import dynamic from "next/dynamic"
// import Link from "next/link"
// import { CityData, CountryData, DeviceData, LanguageData, PageData, SourceData, SystemData, UsersData } from "@/types/website"

// const WorldMapChart = dynamic(() => import("@/components/website/country"), {
//   ssr: false,
//   loading: () => <div className="h-64 w-full animate-pulse bg-gray-100 rounded-xl" />
// })

// export default function AnalyticsPage() {
//   const { company } = useAuth()
//   const reportFilter = useReportFilter()
//   const reportsData = useWebsiteReports()
//   const report = reportsData.filteredReports[0]
//   const users: UsersData | undefined = report?.data?.users
//   const origem: SourceData[] | undefined = report?.data?.origem
//   const system: SystemData[] | undefined = report?.data?.system
//   const devices: DeviceData[] | undefined = report?.data?.devices
//   const pages: PageData[] | undefined = report?.data?.pages
//   const language: LanguageData[] | undefined = report?.data?.language
//   const country: CountryData[] | undefined = report?.data?.country
//   const city: CityData[] | undefined = report?.data?.city

//   if (!report) return null

//   return (
//     <>
//       <div className="flex items-center justify-between">
//         <div>
//           <div className="flex items-center gap-2 mb-1 md">
//             <Globe2 className="w-6 h-6 text-accent" />
//             <h1 className="text-xl md:text-2xl font-bold">Site Corporativo</h1>
//           </div>
//           <p className="text-sm">Acompanhe as métricas do seu site</p>
//         </div>
//         <Link href={`https://${company?.website_domain}`} target="_blank" rel="noopener noreferrer"
//           className="flex items-center justify-center text-sm font-medium p-3 rounded-lg gap-2 bg-accent text-light"
//         >
//           <ExternalLink className="w-5 h-5" />
//           Acessar site
//         </Link>
//       </div>

//       <Card>
//         <section className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
//           <UsersStatistics users={users} />
//         </section>
//       </Card>

//       <section className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
//         {origem && (<SessionsByOrigin origem={origem} />)}
//         {system && (<UsersBySystem system={system} />)}
//         {devices && (<UsersByDevice devices={devices} />)}
//         {pages && (<TopPagesTable site={company?.website_domain || ""} pages={pages} />)}
//         {city && (<TopCitiesTable cities={city} />)}
//         {language && (<LanguageGroupedChart language={language} />)}
//         {country && (<WorldMapChart country={country} />)}
//       </section>
//     </>
//   )
// }

import { Hourglass } from 'ldrs/react'
import 'ldrs/react/Hourglass.css'

export default function MarketingPage() {
  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <Hourglass
          size="40"
          bgOpacity="0.1"
          speed="1.75"
          color="#fa0d1d"
        />
        <h1 className="text-2xl font-semibold">Em breve</h1>
        <p className="text-sm text-dark/75 max-w-lg mx-auto">
          Estamos desenvolvendo novos recursos para otimizar sua experiência com tecnologia e automação.
        </p>
      </div>
    </div>
  )
}
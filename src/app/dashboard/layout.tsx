import { Header } from "@/components/header"
import { NavBar } from "@/components/navigation/navbar"
import { SideBar } from "@/components/navigation/sidebar"
import { AuthProvider } from "@/hooks/useAuth"
import { ReportFilterProvider } from "@/hooks/useFilterContext"

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <ReportFilterProvider>
        <div className="flex flex-col h-svh xl:h-screen">
          <Header />
          <div className="flex flex-1 overflow-hidden h-svh">
            <NavBar />
            <SideBar />
            <main className="flex-1 overflow-auto p-6 pb-24 lg:pb-6 space-y-6 bg-surface/25">
              {children}
            </main>
          </div>
        </div>
      </ReportFilterProvider>
    </AuthProvider>
  )
}
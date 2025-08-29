import { Header } from "@/components/header"
import { NavBar } from "@/components/navbar"
import { AuthProvider } from "@/context/authContext"
import { DigisacFilterProvider } from "@/context/digisacContext"
import { WebsiteFilterProvider } from "@/context/websiteContext"

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <DigisacFilterProvider>
        <WebsiteFilterProvider>
          <div className="flex flex-col h-svh xl:h-screen">
            <Header />
            <div className="flex flex-1 overflow-hidden h-svh">
              <NavBar />
              <main className="flex-1 overflow-auto p-4 lg:p-6 pb-24 lg:pb-6 space-y-4 bg-background">
                {children}
              </main>
            </div>
          </div>
        </WebsiteFilterProvider>
      </DigisacFilterProvider>
    </AuthProvider>
  )
}
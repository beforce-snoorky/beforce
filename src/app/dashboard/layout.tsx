import { Header } from "@/components/header"
import { NavBar } from "@/components/navigation/navbar"
import { SideBar } from "@/components/navigation/sidebar"
import { getServerSession } from "@/context/auth"

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { company } = await getServerSession()

  return (
    <>
      <NavBar company={company} />
      <div className="flex flex-col h-svh xl:h-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden h-svh">
          <SideBar company={company} />
          <main className="flex-1 overflow-auto px-4 bg-surface/25">{children}</main>
        </div>
      </div>
    </>
  )
}
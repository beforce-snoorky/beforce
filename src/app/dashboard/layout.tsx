import { getServerSession } from "@/context/auth";
import Header from "@/layout/header";
import { Navbar } from "@/layout/navbar";
import { Sidebar } from "@/layout/sidebar";

interface DashboardProps {
  children: React.ReactNode
  params: { slug?: string }
}

export default async function DashboardLayout({ children, params }: DashboardProps) {
  const { user, company, isAdmin } = await getServerSession()
  const pathname = "/dashboard" + (params.slug ? `/${params.slug}` : "")

  return (
    <div className="flex flex-col h-svh xl:h-screen">
      <Header user={user} company={company} />
      <div className="flex flex-1 overflow-hidden h-svh">
        <Navbar pathname={pathname} isAdmin={isAdmin} />
        <Sidebar pathname={pathname} isAdmin={isAdmin} />
        <main className="flex-1 overflow-auto px-4 bg-surface/25">
          {children}
        </main>
      </div>
    </div>
  )
}
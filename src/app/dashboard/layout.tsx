import Header from "@/layout/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-svh xl:h-screen">
      <Header />
      {children}
    </div>
  )
}
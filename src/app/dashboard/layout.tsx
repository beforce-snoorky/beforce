import { NavBar } from "@/components/navigation/navbar";
import { getServerSession } from "@/context/auth";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { company } = await getServerSession()

  return (
    <>
      <NavBar company={company} />
      {children}
    </>
  )
}
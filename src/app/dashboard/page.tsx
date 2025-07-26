import { getServerSession } from "@/context/auth"

export default async function DashboardPage() {
  const { user, company, isAdmin } = await getServerSession()

  return (
    <div>
      <h1>Seja bem-vindo ao seu painel</h1>
      <p>Email: {user?.email}</p>
      <p>Empresa: {company.business_name}</p>
      <p>Admin: {isAdmin ? "Sim" : "Não"}</p>
    </div>
  )
}
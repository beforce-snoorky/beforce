import { AddUserButton } from "@/components/users/addUserButton"
import UsersDesktopTable from "@/components/users/desktopList"
import UsersMobileList from "@/components/users/mobileList"
import { UserCog, UserPlus } from "lucide-react"

export default function Users() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1 md">
            <UserCog className="w-6 h-6 text-accent" />
            <h1 className="text-xl md:text-2xl font-bold">Usuários</h1>
          </div>
          <p className="text-sm">Acompanhe as métricas de atendimento</p>
        </div>
        <AddUserButton />
      </div>

      <UsersMobileList />
      <UsersDesktopTable />
    </>
  )
}
import { AddUserButton } from "@/components/users/addUserButton"
import UsersDesktopTable from "@/components/users/desktopList"
import UsersMobileList from "@/components/users/mobileList"
import { Users2 } from "lucide-react"

export default function Users() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1 md">
            <Users2 className="w-6 h-6 text-accent" />
            <h1 className="text-xl md:text-2xl font-bold">Usuários</h1>
          </div>
          <p className="text-sm">Adicione, edite e remova usuários conforme necessário</p>
        </div>
        <AddUserButton />
      </div>

      <UsersMobileList />
      <UsersDesktopTable />
    </>
  )
}
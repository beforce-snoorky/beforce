import { AddUserButton } from "@/components/companies/addUserButton";
import UsersDesktopTable from "@/components/companies/desktopList";
import UsersMobileList from "@/components/companies/mobileList";
import { Building2 } from "lucide-react";

export default function CompaniesPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1 md">
            <Building2 className="w-6 h-6 text-accent" />
            <h1 className="text-xl md:text-2xl font-bold">Empresas</h1>
          </div>
          <p className="text-sm">Gerencie as empresas cadastradas</p>
        </div>
        <AddUserButton />
      </div>

      <UsersMobileList />
      <UsersDesktopTable />
    </>
  )
}
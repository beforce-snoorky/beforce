"use client"

import { AddUserButton } from "@/components/companies/addUserButton"
import { UsersDesktopTable } from "@/components/companies/desktopList"
import { UsersMobileList } from "@/components/companies/mobileList"
import { Building2, Search } from "lucide-react"
import { useCompanies } from "@/hooks/useCompanies"
import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { useMediaQuery } from "@/hooks/useMediaQuery"

export default function CompaniesPage() {
  const isMobileViewport = useMediaQuery("(max-width: 767px)")
  const { companies, total, page, perPage, search, loading, totalPages,
    setPage, setPerPage, setSearch, refetch } = useCompanies()

  const onSuccessRefetch = () => refetch()

  const paginationProps = useMemo(() => ({ page, perPage, total, totalPages, setPage, setPerPage }),
    [page, perPage, total, totalPages, setPage, setPerPage])

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="size-6 text-accent" />
            <h1 className="text-xl md:text-2xl font-bold">Empresas</h1>
          </div>
          <p className="text-sm">Gerencie as empresas cadastradas</p>
        </div>

        {!isMobileViewport && <AddUserButton onSuccess={onSuccessRefetch} />}
      </div>

      <Input
        id="search"
        icon={<Search className="size-5 text-gray-500" />}
        name="search"
        type="text"
        placeholder="Buscar empresas por nome..."
        autoComplete="search"
        className="placeholder:text-sm border border-surface bg-light text-gray-800"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <section>


        {isMobileViewport ? (
          <UsersMobileList
            companies={companies}
            loading={loading}
            onSuccess={onSuccessRefetch}
            pagination={paginationProps}
          />
        ) : (
          <UsersDesktopTable
            companies={companies}
            loading={loading}
            onSuccess={onSuccessRefetch}
            pagination={paginationProps}
          />
        )}
      </section>
    </>
  )
}
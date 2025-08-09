"use client"

import { AddUserButton } from "@/components/companies/addUserButton"
import { UsersDesktopTable } from "@/components/companies/desktopList"
import { UsersMobileList } from "@/components/companies/mobileList"
import { Building2 } from "lucide-react"
import { useCompanies } from "@/hooks/useCompanies"
import { useMemo } from "react"

export default function CompaniesPage() {
  const {
    companies,
    total,
    page,
    perPage,
    setPage,
    setPerPage,
    search,
    setSearch,
    loading,
    refetch,
    totalPages
  } = useCompanies()

  const onSuccessRefetch = () => refetch()

  const paginationProps = useMemo(() => ({
    page, perPage, setPage, setPerPage, total, totalPages
  }), [page, perPage, total, totalPages, setPage, setPerPage])

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
        <AddUserButton onSuccess={onSuccessRefetch} />
      </div>

      {/* Search + pagination controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 my-4">
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar empresas por nome..."
            className="w-full border border-surface rounded-lg px-3 py-2 text-sm"
            aria-label="Buscar empresas"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm">Por página</label>
          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }}
            className="border border-surface rounded-lg px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Mobile (single-column) */}
      <UsersMobileList
        companies={companies}
        loading={loading}
        onSuccess={onSuccessRefetch}
        pagination={paginationProps}
      />

      {/* Desktop (table) */}
      <UsersDesktopTable
        companies={companies}
        loading={loading}
        onSuccess={onSuccessRefetch}
        pagination={paginationProps}
      />
    </>
  )
}
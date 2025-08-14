"use client";

import { Input } from "@/components/ui/input";
import { AddUserButton } from "@/components/users/addUserButton";
import UsersDesktopTable from "@/components/users/desktopList";
import { UsersMobileList } from "@/components/users/mobileList";
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { useUsers } from "@/hooks/useUsers";
import { Search, Users2 } from "lucide-react";
import { useMemo } from "react";

export default function Users() {
  const isMobileViewport = useMediaQuery("(max-width: 767px)")
  const { users, total, page, perPage, search, loading, totalPages,
    setPage, setPerPage, setSearch, refetch } = useUsers()

  const onSuccessRefetch = () => refetch()

  const paginationProps = useMemo(() => ({ page, perPage, total, totalPages, setPage, setPerPage }),
    [page, perPage, total, totalPages, setPage, setPerPage])

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users2 className="size-6 text-accent" />
            <h1 className="text-xl md:text-2xl font-bold">Usuários</h1>
          </div>
          <p className="text-sm">Adicione, edite e remova usuários conforme necessário</p>
        </div>
        {!isMobileViewport && <AddUserButton onSuccess={onSuccessRefetch} />}
      </div>

      <Input
        id="search"
        icon={<Search className="size-5 text-gray-500" />}
        name="search"
        type="text"
        placeholder="Buscar usuários por nome..."
        autoComplete="search"
        className="placeholder:text-sm border border-surface bg-light text-gray-800"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <section>
        {isMobileViewport ? (
          <UsersMobileList
            users={users}
            loading={loading}
            onSuccess={onSuccessRefetch}
            pagination={paginationProps}
          />
        ) : (
          <UsersDesktopTable
            users={users}
            loading={loading}
            onSuccess={onSuccessRefetch}
            pagination={paginationProps}
          />
        )}
      </section>
    </>
  )
}
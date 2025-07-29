"use client"

import { UserPlus } from "lucide-react"
import { useState } from "react"
import { CompanyFormModal } from "./userModal"

export function AddUserButton({ onSuccess }: { onSuccess?: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="hidden xl:flex text-sm font-medium justify-center items-center p-3 rounded-lg gap-2 bg-accent text-light"
      >
        <UserPlus className="w-5 h-5" />
        Adicionar Usuário
      </button>

      {isModalOpen && (
        <CompanyFormModal
          mode="create"
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            onSuccess?.()
            setIsModalOpen(false)
          }}
        />
      )}
    </>
  )
}
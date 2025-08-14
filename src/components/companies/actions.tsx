"use client"

import { Company } from "@/types/company"
import { handleCompanyAction } from "@/utils/companyActions"
import { useState } from "react"
import toast from "react-hot-toast"
import { CompanyFormModal } from "./userModal"

type CompanyActionButtonProps = {
  icon: React.ReactNode
  label: string
  showLabel?: boolean
  action: "updateCompany" | "createCompany" | "deleteCompany"
  company?: Company
  onSuccess?: () => void
}

export function CompanyActionButton(props: CompanyActionButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (props.action === "deleteCompany" && props.company) {
      toast((t) => (
        <div className="flex flex-col gap-2 p-2 text-sm">
          <span>Tem certeza que deseja excluir a empresa?</span>
          <div className="flex items-center justify-center gap-2">
            <button
              className="flex-1 py-2 px-4 font-medium rounded-lg bg-accent text-light"
              onClick={async () => {
                toast.dismiss(t.id)
                const success = await handleCompanyAction("deleteCompany", { id: props.company!.id })
                if (success) props.onSuccess?.()
              }}
            >
              Confirmar
            </button>
            <button
              className="flex-1 py-2 px-4 font-medium rounded-lg bg-gray-200"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancelar
            </button>
          </div>
        </div>
      ))
    } else {
      setIsModalOpen(true)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        title={props.label}
        className={props.showLabel ? "w-full flex items-center justify-center gap-2" : ""}
      >
        {props.icon}
        {props.showLabel && <span>{props.label}</span>}
      </button>

      {isModalOpen && (
        <CompanyFormModal
          mode={props.action === "createCompany" ? "create" : "update"}
          company={props.action === "updateCompany" ? props.company : undefined}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            props.onSuccess?.()
            setIsModalOpen(false)
          }}
        />
      )}
    </>
  )
}
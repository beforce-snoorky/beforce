"use client"

import { UserBase } from "@/types/users";
import { useState } from "react";
import toast from "react-hot-toast";
import { UserFormModal } from "./userModal";
import { handleUserAction } from "@/context/actions";

type UserActionButtonProps = {
  icon: React.ReactNode
  label: string
  showLabel?: boolean
  action: "updateUser" | "createUser" | "deleteUser"
  user?: UserBase
  onSuccess?: () => void
}

export function UserActionButton(props: UserActionButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (props.action === "deleteUser" && props.user) {
      toast((t) => (
        <div className="flex flex-col gap-2 p-2 text-sm">
          <span>Tem certeza que deseja excluir este usuário?</span>
          <div className="flex items-center justify-center gap-2">
            <button
              className="flex-1 p-2 font-medium rounded-lg bg-accent text-light"
              onClick={async () => {
                toast.dismiss(t.id)
                const success = await handleUserAction("deleteUser", { id: props.user!.id })
                if (success) props.onSuccess?.()
              }}
            >
              Confirmar
            </button>
            <button
              className="flex-1 p-2 font-medium rounded-lg bg-gray-200"
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
        <UserFormModal
          mode={props.action === "createUser" ? "create" : "update"}
          user={props.action === "updateUser" ? props.user : undefined}
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
import { handleAction } from "./handleAction"

type UserActionType = "createUser" | "updateUser" | "deleteUser"

type UserPayload = {
  id?: string
  email?: string
  password?: string
}

export function handleUserAction(action: UserActionType, payload: UserPayload) {
  return handleAction<UserActionType, UserPayload>({
    action,
    payload,
    apiRoute: "/api/admin",
    toastMessages: {
      createUser: "Criando usuário...",
      updateUser: "Atualizando usuário...",
      deleteUser: "Excluindo usuário..."
    }
  })
}
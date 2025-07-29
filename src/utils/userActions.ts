import toast from "react-hot-toast"

type UserActionType = "createUser" | "updateUser" | "deleteUser"

type Payload = {
  id?: string
  email?: string
  password?: string
}

export async function handleUserAction(action: UserActionType, payload: Payload) {
  const toastMessages = {
    createUser: "Criando usuário...",
    updateUser: "Atualizando usuário...",
    deleteUser: "Excluindo usuário..."
  }

  const toastId = toast.loading(toastMessages[action] || "Processando...")

  try {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload })
    })

    if (!res.ok) throw new Error()

    toast.success("Ação realizada com sucesso.", { id: toastId })
    return true
  } catch {
    toast.error("Erro ao processar ação.", { id: toastId })
    return false
  }
}
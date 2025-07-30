import toast from "react-hot-toast"

type AnyAction = string
type AnyPayload = Record<string, unknown>

interface HandleActionParams<ActionType extends AnyAction, PayloadType extends AnyPayload> {
  action: ActionType
  payload: PayloadType
  apiRoute: string
  toastMessages: Record<ActionType, string>
}

export async function handleAction<ActionType extends AnyAction, PayloadType extends AnyPayload>(params: HandleActionParams<ActionType, PayloadType>): Promise<boolean> {
  const { action, payload, apiRoute, toastMessages } = params
  const toastId = toast.loading(toastMessages[action] || "Processando...")

  try {
    const res = await fetch(apiRoute, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    })

    if (!res.ok) throw new Error()

    toast.success("Ação realizada com sucesso.", { id: toastId })
    return true
  } catch {
    toast.error("Erro ao processar ação.", { id: toastId })
    return false
  }
}
export async function getUsers() {
  const res = await fetch("/api/users", { cache: "no-store" })
  if (!res.ok) throw new Error("Erro ao carregar usuários")
  const users = await res.json()
  return users
}
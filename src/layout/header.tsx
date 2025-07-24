import UserMenu from "@/components/user"
import { createClient } from "@/utils/supabase/server"
import Image from "next/image"
import { redirect } from "next/navigation"

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) redirect("/")

  const domain = user.email.split("@")[1]
  const { data: company } = await supabase.from('users').select('id, business_name').eq('domain', domain).single()

  return (
    <header className="flex items-center p-4 border-b border-surface bg-light">
      <div className="w-56">
        <Image
          src="/logo-dark.png"
          alt="Beforce"
          width={95}
          height={43}
          sizes="(max-width: 768px) 95px, 95px"
          priority
        />
      </div>

      <div className="ml-auto">
        <UserMenu user={user} company={company} />
      </div>
    </header>
  )
}
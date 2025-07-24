import UserMenu from "@/components/user"
import { Company } from "@/types/user"
import { User } from "@supabase/supabase-js"
import Image from "next/image"

export default async function Header({ user, company }: { user: User | null, company: Company | null }) {
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
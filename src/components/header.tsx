import Image from "next/image"
import UserMenu from "./ui/user"
import { getServerSession } from "@/context/auth"
import Link from "next/link"

export async function Header() {
  const { user, company, isAdmin } = await getServerSession()

  return (
    <header className="flex items-center p-4 border-b border-surface bg-light">
      <Link href="/dashboard">
        <Image
          src="/beforce.png"
          alt="Beforce"
          width={116}
          height={20}
          sizes="(max-width: 768px) 116px, 116px"
          priority
        />
      </Link>
      <div className="ml-auto">
        <UserMenu user={user} company={company} isAdmin={isAdmin} />
      </div>
    </header>
  )
}
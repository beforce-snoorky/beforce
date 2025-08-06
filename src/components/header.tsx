import Image from "next/image"
import Link from "next/link"
import UserMenu from "./ui/user"

export function Header() {
  return (
    <header className="flex items-center p-4 border-b border-surface bg-light">
      <Link href="/analysis">
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
        <UserMenu />
      </div>
    </header>
  )
}
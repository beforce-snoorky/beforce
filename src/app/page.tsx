import { Login } from "@/components/login"
import Image from "next/image"

export default function Home() {
  return (
    <main className="min-h-svh min-w-svw bg-cover bg-no-repeat flex items-center justify-center" style={{ backgroundImage: "url('/background.svg')" }}>
      <div className="flex flex-col items-center space-y-4">
        <Image
          src="/logo-light.png"
          alt="Beforce"
          width={125}
          height={66}
          sizes="125px"
          priority
        />
        <h1 className="sr-only">Acesse sua conta!</h1>
        <Login />
      </div>
    </main>
  )
}
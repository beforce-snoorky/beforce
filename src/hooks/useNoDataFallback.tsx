"use client"

import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export function NoDataFallback() {
  return (
    <section className="w-full h-full flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 rounded-lg p-3 bg-accent-light">
          <AlertTriangle className="size-6 text-accent" />
        </div>
        <h1 className="text-2xl font-semibold">Sem dados disponíveis</h1>
        <p className="text-sm text-dark/75 max-w-lg mx-auto">Ainda não há dados para exibir. Se você acha que deveria haver, por favor entre em contato com o suporte.</p>
        <Link href="https://api.whatsapp.com/send?phone=551530420727" className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium bg-accent text-white">
          Falar com Suporte
        </Link>
      </div>
    </section>
  )
}

import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Relatórios Mensais | Beforce Dashboard",
  description: "Acompanhe relatórios mensais de desempenho de atendimento de forma inteligente e automatizada com a Beforce.",
  keywords: ["dashboard", "relatórios", "atendimentos", "Beforce", "automação", "n8n", "Supabase"],
  openGraph: {
    title: "Relatórios de Atendimento | Beforce",
    description: "Visualize, compartilhe e imprima seus relatórios mensais com facilidade.",
    url: "https://dashboard.beforce.com.br",
    siteName: "Beforce Dashboard",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://dashboard.beforce.com.br/beforce.png",
        alt: "Relatório Mensal de Atendimento",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Relatórios de Atendimento | Beforce",
    description: "Visualize, compartilhe e imprima seus relatórios mensais com facilidade.",
    images: [
      {
        url: "https://dashboard.beforce.com.br/beforce.png",
        alt: "Relatório Mensal de Atendimento",
        width: 1200,
        height: 630,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
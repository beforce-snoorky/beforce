import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Relatórios Mensais | Beforce Dashboard",
  description: "Acompanhe relatórios mensais de desempenho de forma inteligente e automatizada.",
  keywords: ["dashboard", "relatórios", "atendimentos", "Beforce", "automação", "n8n", "Supabase"],
  openGraph: {
    title: "Relatórios Mensais | Beforce Dashboard",
    description: "Acompanhe relatórios mensais de desempenho de forma inteligente e automatizada.",
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
    title: "Relatórios Mensais | Beforce Dashboard",
    description: "Acompanhe relatórios mensais de desempenho de forma inteligente e automatizada.",
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
      <body>{children}</body>
    </html>
  )
}
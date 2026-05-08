"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/context/auth"
import { fetchDashboardPageData } from "@/lib/api"
import { Brain, Cloud, Gauge, Globe2, Mail, MessageCircleMore, MonitorSmartphone, Server } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { useMemo } from "react"
import { DashboardSkeleton } from "./skeleton"
import { QueryErrorState } from "../ui/queryErrorState"
import { Card } from "../ui/card"
import { DigitalScore } from "../ui/digitalScore"

export function DashboardClient() {
	const { company } = useAuth()
	const translate = useTranslations("Dashboard")
	const dashboardQuery = useQuery({
		queryKey: ["dashboard", company.companyId],
		queryFn: ({ signal }) => fetchDashboardPageData({ companyId: company.companyId, signal }),
		refetchOnWindowFocus: false,
		staleTime: 5 * 60 * 1000,
	})

	const solutions = useMemo(
		() => [
			{
				key: "website",
				style: "text-purple-600 bg-purple-500/10",
				label: `${translate("services.website.title")}`,
				icon: <Globe2 className="size-5" />,
				description: `${translate("services.website.description")}`,
			},
			{
				key: "email",
				style: "text-emerald-600 bg-emerald-500/10",
				label: `${translate("services.email.title")}`,
				icon: <Mail className="size-5" />,
				description: `${translate("services.email.description")}`,
			},
			{
				key: "server",
				style: "text-sky-600 bg-sky-500/10",
				label: `${translate("services.server.title")}`,
				icon: <Cloud className="size-5" />,
				description: `${translate("services.server.description")}`,
			},
			{
				key: "system",
				style: "text-amber-600 bg-amber-500/10",
				label: `${translate("services.system.title")}`,
				icon: <Server className="size-5" />,
				description: `${translate("services.system.description")}`,
			},
			{
				key: "digisac",
				style: "text-fuchsia-600 bg-fuchsia-500/10",
				label: `${translate("services.digisac.title")}`,
				icon: <MessageCircleMore className="size-5" />,
				description: `${translate("services.digisac.description")}`,
			},
			{
				key: "ia",
				style: "text-rose-600 bg-rose-500/10",
				label: `${translate("services.ia.title")}`,
				icon: <Brain className="size-5" />,
				description: `${translate("services.ia.description")}`,
			},
			{
				key: "marketing",
				style: "text-cyan-600 bg-cyan-500/10",
				label: `${translate("services.marketing.title")}`,
				icon: <MonitorSmartphone className="size-5" />,
				description: `${translate("services.marketing.description")}`,
			},
		],
		[translate]
	)

	if (dashboardQuery.isPending && !dashboardQuery.data) {
		return <DashboardSkeleton />
	}

	if (dashboardQuery.error && !dashboardQuery.data) {
		return (
			<QueryErrorState
				title={translate("states.failedToLoadTitle")}
				description={translate("states.failedToLoadDescription")}
				actionLabel={translate("states.retry")}
				onRetry={() => void dashboardQuery.refetch()}
			/>
		)
	}

	const services = dashboardQuery.data?.services ?? []
	const servicesMap = Object.fromEntries(services.map((service) => [service.code, service.isActive]))
	const activeServicesCount = services.filter((service) => service.isActive).length
	const totalServicesCount = services.length
	const score = totalServicesCount > 0 ? Math.round((activeServicesCount / totalServicesCount) * 100) : 0

	return (
		<>
			<header className="space-y-1 mb-4 lg:mb-7">
				<h1 className="flex items-center gap-2 text-xl lg:text-2xl font-semibold tracking-tight">
					<Gauge className="size-6 lg:size-8 text-primary" /> {translate("title")}
				</h1>
				<p className="text-sm lg:text-base text-muted-foreground">{translate("subtitle")}</p>
			</header>

			<section className="grid grid-cols-1 lg:grid-cols-6 gap-4">
				<div className="col-span-1 lg:col-span-3 space-y-4">
					<div className="p-4 rounded-4xl bg-background h-full">
						<DigitalScore
							score={score}
							activeCount={activeServicesCount}
							total={totalServicesCount}
						/>
					</div>
				</div>

				<div className="col-span-1 lg:col-span-3 relative flex px-4 pt-6 lg:pt-8 rounded-4xl bg-linear-145 to-to from-from">
					<div
						className="absolute inset-0 bg-cover opacity-30 rounded-4xl"
						style={{ backgroundImage: "url('/images/support-background.jpg')" }}
					/>

					<div className="relative flex flex-col items-start justify-between gap-6 mb-6 lg:mb-8 w-full">
						<div className="space-y-3 text-primary-foreground">
							<h2 className="text-base lg:text-lg font-semibold">{translate("support.title")}</h2>
							<p className="text-sm lg:text-base">{translate("support.description")}</p>
						</div>

						<Link
							href="https://api.whatsapp.com/send?phone=551530420727"
							className="flex items-center justify-center whitespace-nowrap gap-2 px-4 py-2 text-sm rounded-4xl bg-emerald-600 hover:bg-emerald-700 text-primary-foreground"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 16 16"
								width="16"
								height="16"
								fill="currentColor"
							>
								<path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
							</svg>
							{translate("support.contactAction")}
						</Link>
					</div>

					<div className="relative w-full lg:h-72 mt-2 lg:-mt-12">
						<Image
							src="/images/maximus.png"
							alt={translate("support.imageAlt")}
							className="object-contain"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							fill
						/>
					</div>
				</div>

				<div className="col-span-1 lg:col-span-6 mt-4">
					<h2 className="text-base lg:text-lg font-semibold">{translate("services.title")}</h2>

					<div className="flex flex-col gap-3 lg:gap-4 mt-3 lg:mt-4">
						{solutions.map((item) => {
							const isActive = servicesMap[item.key]

							return (
								<Card key={item.key}>
									<div className="flex items-start lg:items-center justify-between gap-4">
										<div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-4">
											<div className={`p-2 rounded-xl ${item.style}`}>{item.icon}</div>
											<div className="space-y-1">
												<h3 className="font-medium">{item.label}</h3>
												<p className="text-sm leading-tight text-foreground-muted">{item.description}</p>
											</div>
										</div>
										{isActive ? (
											<div className="relative flex items-center">
												<div className="w-10 h-6 rounded-4xl bg-emerald-500/50" />
												<div className="absolute left-5 size-4 rounded-4xl bg-primary-foreground " />
											</div>
										) : (
											<Link
												href="https://api.whatsapp.com/send?phone=551530420727"
												className="px-4 py-2 rounded-4xl text-xs bg-primary hover:bg-primary-hover text-primary-foreground"
											>
												{translate("contact")}
											</Link>
										)}
									</div>
								</Card>
							)
						})}
					</div>
				</div>
			</section>
		</>
	)
}

"use client"

import type { SystemStatisticsProps } from "@/types/website"
import { normalizeSystemName, toNumber } from "@/utils/website"
import { MonitorSmartphone } from "lucide-react"
import { useMemo } from "react"
import { systemsIcons } from "./system-icons"

export function SystemStatistics({ system, devices, translate }: SystemStatisticsProps) {
	const { deviceStats, systemStats, totalSystemUsers } = useMemo(() => {
		const deviceTotal = devices.reduce((sum, item) => sum + toNumber(item.activeUsers), 0)
		const deviceAccumulator: Record<string, { label: string; value: number; percentage: number }> = {}

		for (const item of devices) {
			const key = item.deviceCategory.toLowerCase()
			const value = toNumber(item.activeUsers)

			deviceAccumulator[key] = { label: item.deviceCategory, value, percentage: deviceTotal ? (value / deviceTotal) * 100 : 0 }
		}

		const mergedSystems: Record<string, number> = {}
		for (const item of system) {
			const key = normalizeSystemName(item.operatingSystem)
			mergedSystems[key] = (mergedSystems[key] ?? 0) + toNumber(item.activeUsers)
		}

		const total = Object.values(mergedSystems).reduce((sum, value) => sum + value, 0)
		const sortedSystems = Object.entries(mergedSystems)
			.map(([label, value]) => ({ label, value }))
			.sort((left, right) => right.value - left.value)

		return { deviceStats: deviceAccumulator, systemStats: sortedSystems, totalSystemUsers: total }
	}, [system, devices])

	const desktopPercent = deviceStats.desktop?.percentage.toFixed(1) ?? "0.0"
	const mobilePercent = deviceStats.mobile?.percentage.toFixed(1) ?? "0.0"

	return (
		<div className="p-4 rounded-4xl flex flex-col gap-4 bg-background">
			<div>
				<div className="flex items-center gap-2">
					<div className="text-primary">
						<MonitorSmartphone className="size-5" />
					</div>
					<h2 className="font-semibold text-foreground tracking-tight">{translate("system.title")}</h2>
				</div>
				<p className="text-xs text-foreground-muted">{translate("system.subtitle")}</p>
			</div>

			<div>
				<h4 className="text-4xl font-medium text-accent">{mobilePercent}%</h4>
				<p className="text-sm text-foreground-muted mt-2">{translate("system.distribution", { desktop: desktopPercent })}</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-sm:max-h-64 lg:h-full max-sm:overflow-y-auto">
				{systemStats.map((os) => (
					<div
						key={os.label}
						className="flex items-center gap-2 p-4 rounded-3xl bg-background-muted"
					>
						{systemsIcons[os.label]}
						<p className="text-sm text-foreground-muted">{os.label}</p>
						<p className="text-sm font-semibold ml-auto">{((os.value / totalSystemUsers) * 100).toFixed(1)}%</p>
					</div>
				))}
			</div>
		</div>
	)
}

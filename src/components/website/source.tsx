"use client"

import type { SourceStatisticsProps } from "@/types/website"
import { toNumber, translateSourceChannel } from "@/utils/website"
import { SafeEChart } from "@/components/ui/safeEChart"
import type { EChartsOption } from "echarts-for-react"
import { Network } from "lucide-react"
import { useMemo } from "react"
import { ChartCard } from "./charts"

export function SourceStatistics({ origem, translate }: SourceStatisticsProps) {
	const chartData = useMemo(() => {
		const sorted = [...origem].sort((left, right) => toNumber(right.sessions) - toNumber(left.sessions))

		return {
			categories: sorted.map((item) => translateSourceChannel(item.sessionDefaultChannelGroup, translate)),
			values: sorted.map((item) => toNumber(item.sessions)),
		}
	}, [origem, translate])

	const option = useMemo<EChartsOption>(() => {
		if (!chartData.categories.length) return {}

		const colors = [
			"#155dfc",
			"#00a63e",
			"#9810fa",
			"#e60076",
			"#8b5cf6",
			"#14b8a6",
			"#e11d48",
			"#7c3aed",
			"#f97316",
			"#0ea5e9",
			"#10b981",
			"#f43f5e",
			"#6366f1",
			"#22c55e",
			"#a855f7",
			"#ec4899",
		]

		const coloredData = chartData.values.map((item, index) => ({
			value: item,
			itemStyle: { color: colors[index % colors.length] },
		}))

		return {
			tooltip: { trigger: "item", formatter: "{c}" },
			grid: { top: 40, right: 8, bottom: 0, left: 0, containLabel: true },
			legend: { left: "center", right: "center", bottom: 0, textStyle: { fontSize: 10, overflow: "truncate", width: 70 } },

			xAxis: {
				type: "category",
				data: chartData.categories,
				axisLabel: { fontSize: 10, interval: 0, hideOverlap: true },
				axisLine: { lineStyle: { color: "#80828d22" } },
			},
			yAxis: {
				type: "value",
				axisLabel: { formatter: "{value}" },
				splitLine: { lineStyle: { color: "#80828d22", type: "dashed" } },
			},
			series: [
				{
					type: "bar",
					data: coloredData,
					itemStyle: { borderRadius: [32, 32, 0, 0] },
					label: { show: true, position: "top", formatter: "{c} min", fontSize: 10, color: "#80828d" },
				},
			],
		}
	}, [chartData])

	return (
		<ChartCard
			title={translate("source.title")}
			subtitle={translate("source.subtitle")}
			icon={<Network className="size-5" />}
		>
			<SafeEChart
				option={option}
				height={280}
			/>
		</ChartCard>
	)
}

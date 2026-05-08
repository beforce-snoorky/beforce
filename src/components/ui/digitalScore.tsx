"use client"

import { SafeEChart } from "@/components/ui/safeEChart"
import type { DigitalScoreProps } from "@/types/ui"
import type { EChartsOption } from "echarts-for-react"
import { useTranslations } from "next-intl"

export function DigitalScore({ score, activeCount, total }: DigitalScoreProps) {
	const translate = useTranslations("Dashboard.Gauge")

	const getScoreMessage = (score: number) => {
		if (score >= 100) return `${translate("scores.moreThan100")}`
		if (score >= 75) return `${translate("scores.moreThan75")}`
		if (score >= 50) return `${translate("scores.moreThan50")}`
		return `${translate("scores.noScore")}`
	}

	const gaugeOptions: EChartsOption = {
		series: [
			{
				type: "gauge",
				startAngle: 180,
				endAngle: 0,
				min: 0,
				max: 100,
				center: ["50%", "75%"],
				radius: "150%",
				splitNumber: 0,
				axisLine: {
					lineStyle: {
						width: 16,
						color: [
							[0.25, "#EF4444"],
							[0.5, "#F59E0B"],
							[0.75, "#EAB308"],
							[1, "#10B981"],
						],
						shadowColor: "rgba(0,138,255,0.45)",
						shadowBlur: 0,
					},
					roundCap: true,
				},
				pointer: { length: "75%", width: 8, offsetCenter: [0, "5%"], itemStyle: { color: "#fa0d1d" } },
				progress: { show: false },
				splitLine: { show: false },
				axisLabel: { show: false },
				title: { show: false },
				detail: { show: false },
				data: [{ value: score }],
			},
		],
	}

	return (
		<div className="flex flex-col justify-between h-full">
			<h2 className="text-lg font-semibold">{translate("digitalPoint")}</h2>
			<div className="mt-auto">
				<div className="max-w-xl mx-auto mt-4">
					<SafeEChart
						option={gaugeOptions}
						height={150}
					/>
				</div>
				<div className="text-center text-sm text-foreground-muted">
					<p>{translate("status", { activeCount: activeCount, total: total })}</p>
					<p>{getScoreMessage(score)}</p>
				</div>
			</div>
		</div>
	)
}

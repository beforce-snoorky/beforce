import type { DigisacMetricsProps, MetricCardProps } from "@/types/digisac"
import { SafeEChart } from "@/components/ui/safeEChart"
import type { EChartsOption } from "echarts-for-react"
import { Card } from "../ui/card"

export function DigisacMetrics({ metricCards, numberFormatter }: DigisacMetricsProps) {
	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
			{metricCards.map((metricCard) => (
				<MetricCard
					key={metricCard.label}
					label={metricCard.label}
					value={numberFormatter.format(metricCard.value)}
					series={metricCard.series}
					icon={metricCard.icon}
					iconClassName={metricCard.iconClassName}
					stroke={metricCard.stroke}
				/>
			))}
		</div>
	)
}

function MetricCard({ label, value, icon: Icon, iconClassName, series, stroke }: MetricCardProps) {
	return (
		<Card>
			<div className="lg:flex items-center justify-between gap-4">
				<div className="lg:w-1/2">
					<div className="flex items-center gap-2 mb-1">
						<div className={`size-8 flex items-center justify-center rounded-xl ${iconClassName}`}>
							<Icon className="size-5" />
						</div>

						<p className="text-xl font-medium tracking-tight">{value}</p>
					</div>

					<p className="whitespace-nowrap text-sm text-foreground-muted">{label}</p>
				</div>

				<div className="lg:w-1/2">
					<Sparkline
						values={series}
						stroke={stroke}
					/>
				</div>
			</div>
		</Card>
	)
}

function Sparkline({ values, stroke }: { values: number[]; stroke: string }) {
	const option: EChartsOption = {
		grid: { left: 0, right: 0, top: 10, bottom: 0 },
		xAxis: { type: "category", show: false, data: values.map((_, index) => index) },
		yAxis: { type: "value", show: false },
		series: [
			{
				data: values,
				type: "line",
				smooth: true,
				symbol: "none",
				lineStyle: { color: stroke, width: 2 },
				areaStyle: { color: `${stroke}22` },
			},
		],
		tooltip: { show: false },
	}

	return (
		<SafeEChart
			option={option}
			height={60}
		/>
	)
}

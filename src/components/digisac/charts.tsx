import type { ChartCardProps, DigisacChartsProps, DigisacDepartmentChartItem, DigisacTopOperatorChartItem } from "@/types/digisac"
import type { EChartsOption } from "echarts-for-react"
import { SafeEChart } from "@/components/ui/safeEChart"
import { BarChart3 } from "lucide-react"
import { Card } from "../ui/card"

export function DigisacCharts({ departmentChart, topOperatorsChart, translate }: DigisacChartsProps) {
	const departmentChartOptions = buildDepartmentChartOptions(departmentChart)
	const topOperatorsChartOptions = buildTopOperatorsChartOptions(topOperatorsChart)

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
			<ChartCard
				title={translate("charts.byDepartment")}
				subtitle={translate("charts.byDepartmentDescription")}
				icon={<BarChart3 className="size-5" />}
			>
				<SafeEChart
					option={departmentChartOptions}
					height={410}
				/>
			</ChartCard>

			<ChartCard
				title={translate("charts.topOperators")}
				subtitle={translate("charts.topOperatorsDescription")}
				icon={<BarChart3 className="size-5" />}
			>
				<SafeEChart
					option={topOperatorsChartOptions}
					height={410}
				/>
			</ChartCard>
		</div>
	)
}

function buildDepartmentChartOptions(departmentChart: DigisacDepartmentChartItem[]): EChartsOption {
	if (!departmentChart.length) return {}

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

	const coloredData = departmentChart.map((item, index) => ({
		value: item.averageMinutes,
		itemStyle: { color: colors[index % colors.length] },
	}))

	return {
		tooltip: { trigger: "item", formatter: "{c}" },
		grid: { top: 40, right: 8, bottom: 0, left: 0, containLabel: true },
		xAxis: {
			type: "category",
			data: departmentChart.map((item) => item.department),
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
}

function buildTopOperatorsChartOptions(topOperatorsChart: DigisacTopOperatorChartItem[]): EChartsOption {
	if (!topOperatorsChart.length) return {}

	const colors = ["#2563eb", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6"]

	return {
		tooltip: { trigger: "item" },
		legend: { left: "center", right: "center", bottom: 0, textStyle: { fontSize: 10, overflow: "truncate", width: 70 } },
		series: [
			{
				name: "Atendimentos",
				type: "pie",
				radius: ["40%", "70%"],
				avoidLabelOverlap: false,
				padAngle: 4,
				itemStyle: { borderRadius: 16 },
				center: ["50%", "40%"],
				label: { show: false },
				data: topOperatorsChart.map((item, index) => ({
					name: item.operatorName,
					value: Number(item.totalTicketsCount),
					itemStyle: { color: colors[index % colors.length] },
				})),
			},
		],
	}
}

function ChartCard({ title, subtitle, icon, children }: ChartCardProps) {
	return (
		<Card>
			<div className="flex items-center gap-2">
				<div className="text-primary">{icon}</div>
				<h2 className="font-semibold tracking-tight">{title}</h2>
			</div>
			<p className="text-xs text-foreground-muted">{subtitle}</p>
			{children}
		</Card>
	)
}

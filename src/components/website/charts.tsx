import type { WebsiteChartCardProps } from "@/types/website"
import { Card } from "../ui/card"

export function ChartCard({ title, subtitle, icon, children }: WebsiteChartCardProps) {
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

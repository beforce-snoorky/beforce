import type { UsersStatisticsProps } from "@/types/website"
import { MousePointerClick, Timer, UserCheck, UserPlus } from "lucide-react"
import { Card } from "../ui/card"

export function UsersStatistics({ users, translate, locale: _locale }: UsersStatisticsProps) {
	const metrics = [
		{
			label: translate("users.totalUsers"),
			style: "text-blue-600 bg-blue-500/10",
			icon: <UserCheck className="size-5" />,
			value: users.totalUsers,
		},
		{
			label: translate("users.newUsers"),
			style: "text-green-600 bg-green-500/10",
			icon: <UserPlus className="size-5" />,
			value: users.newUsers,
		},
		{
			label: translate("users.averageSessionDuration"),
			style: "text-purple-600 bg-purple-500/10",
			icon: <Timer className="size-5" />,
			value: users.averageSessionDuration,
		},
		{
			label: translate("users.engagementRate"),
			style: "text-pink-600 bg-pink-500/10",
			icon: <MousePointerClick className="size-5" />,
			value: users.engagementRate,
		},
	]

	return (
		<>
			{metrics.map((metric) => (
				<Card key={metric.label}>
					<div className="flex items-center gap-2 mb-1">
						<div className={`size-8 flex items-center justify-center rounded-xl ${metric.style}`}>{metric.icon}</div>
						<p className="text-xl font-medium tracking-tight">{metric.value}</p>
					</div>
					<p className="whitespace-nowrap text-sm text-foreground-muted">{metric.label}</p>
				</Card>
			))}
		</>
	)
}

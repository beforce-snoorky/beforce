import { MonitorSmartphone } from "lucide-react"
import type { ServiceEmptyStateProps } from "@/types/states"
import { PremiumEmptyState } from "./premiumEmptyState"

export function MarketingEmptyState({ copy }: ServiceEmptyStateProps) {
	return (
		<PremiumEmptyState
			copy={copy}
			visual={{
				icon: MonitorSmartphone,
				iconClassName: "text-emerald-500",
				badgeClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
			}}
		/>
	)
}

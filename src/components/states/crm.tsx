import { Kanban } from "lucide-react"
import type { ServiceEmptyStateProps } from "@/types/states"
import { PremiumEmptyState } from "./premiumEmptyState"

export function CrmEmptyState({ copy }: ServiceEmptyStateProps) {
	return (
		<PremiumEmptyState
			copy={copy}
			visual={{
				icon: Kanban,
				iconClassName: "text-orange-500",
				badgeClassName: "bg-orange-500/10 text-orange-600 dark:text-orange-300",
			}}
		/>
	)
}

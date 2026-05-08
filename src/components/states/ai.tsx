import { Sparkles } from "lucide-react"
import type { ServiceEmptyStateProps } from "@/types/states"
import { PremiumEmptyState } from "./premiumEmptyState"

export function AiEmptyState({ copy }: ServiceEmptyStateProps) {
	return (
		<PremiumEmptyState
			copy={copy}
			visual={{
				icon: Sparkles,
				iconClassName: "text-purple-500",
				badgeClassName: "bg-purple-500/10 text-purple-600 dark:text-purple-300",
			}}
		/>
	)
}

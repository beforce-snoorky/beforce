import { Mails } from "lucide-react"
import type { ServiceEmptyStateProps } from "@/types/states"
import { PremiumEmptyState } from "./premiumEmptyState"

export function EmailEmptyState({ copy }: ServiceEmptyStateProps) {
	return (
		<PremiumEmptyState
			copy={copy}
			visual={{
				icon: Mails,
				iconClassName: "text-indigo-500",
				badgeClassName: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
			}}
		/>
	)
}

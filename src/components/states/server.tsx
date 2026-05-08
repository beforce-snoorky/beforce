import { CloudCog } from "lucide-react"
import type { ServiceEmptyStateProps } from "@/types/states"
import { PremiumEmptyState } from "./premiumEmptyState"

export function ServerEmptyState({ copy }: ServiceEmptyStateProps) {
	return (
		<PremiumEmptyState
			copy={copy}
			visual={{ icon: CloudCog, iconClassName: "text-sky-500", badgeClassName: "bg-sky-500/10 text-sky-600 dark:text-sky-300" }}
		/>
	)
}

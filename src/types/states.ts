import type { LucideIcon } from "lucide-react"

export type EmptyStateCopy = { badge: string; title: string; description: string }

export type EmptyStateVisualConfig = { icon: LucideIcon; iconClassName: string; badgeClassName: string }

export type PremiumEmptyStateProps = { copy: EmptyStateCopy; visual: EmptyStateVisualConfig }

export type ServiceEmptyStateProps = Pick<PremiumEmptyStateProps, "copy">

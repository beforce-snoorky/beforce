import type { PremiumEmptyStateProps } from "@/types/states"

export type { EmptyStateCopy, EmptyStateVisualConfig } from "@/types/states"

export function PremiumEmptyState({ copy, visual }: PremiumEmptyStateProps) {
	const MainIcon = visual.icon

	return (
		<section className="max-sm:py-40 h-full">
			<div className="mx-auto flex h-full w-full flex-col items-center justify-center text-center">
				<MainIcon className={`size-14 ${visual.iconClassName} animate-pulse`} />

				<span
					className={`mt-6 inline-flex rounded-4xl px-3 py-1 text-xs font-semibold uppercase tracking-widest ${visual.badgeClassName}`}
				>
					{copy.badge}
				</span>

				<h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">{copy.title}</h1>
				<p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground-muted">{copy.description}</p>
			</div>
		</section>
	)
}

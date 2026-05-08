import { Button } from "@/components/ui/button"

export function QueryErrorState({
	title,
	description,
	actionLabel,
	onRetry,
}: {
	title: string
	description: string
	actionLabel: string
	onRetry: () => void
}) {
	return (
		<div className="rounded-4xl bg-background p-6 text-center">
			<h2 className="text-lg font-semibold text-foreground">{title}</h2>
			<p className="mt-2 text-sm text-foreground-muted">{description}</p>
			<div className="mt-4 flex justify-center">
				<Button
					type="button"
					variant="secondary"
					onClick={onRetry}
				>
					{actionLabel}
				</Button>
			</div>
		</div>
	)
}

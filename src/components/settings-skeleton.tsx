import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SettingsSkeleton() {
	return (
		<>
			<header className="space-y-1 mb-4 lg:mb-7">
				<div className="flex items-center gap-2">
					<Skeleton className="size-6 lg:size-8 bg-background" />
					<Skeleton className="h-5 w-48 bg-background" />
				</div>
				<Skeleton className="h-5 w-72 bg-background" />
			</header>

			<section className="space-y-4">
				<div className="flex flex-col gap-4 md:flex-row md:items-start">
					<div className="w-full md:max-w-md md:flex-none">
						<Card>
							<div className="space-y-4">
								<Skeleton className="h-6 w-32 bg-background-muted" />
								<Skeleton className="h-4 w-full bg-background-muted" />
								<Skeleton className="h-11 w-full bg-background-muted" />
							</div>
						</Card>
					</div>

					<section className="w-full flex-1 rounded-4xl bg-background p-4 space-y-4">
						<div className="space-y-2">
							<Skeleton className="h-6 w-40 bg-background-muted" />
							<Skeleton className="h-4 w-72 bg-background-muted" />
						</div>

						<div className="flex flex-col gap-2 rounded-4xl bg-background-muted p-4 md:flex-row md:items-center md:justify-between">
							<Skeleton className="h-11 w-full md:max-w-sm bg-background" />
							<Skeleton className="h-11 w-full lg:w-32 bg-background" />
						</div>

						<div className="space-y-3 p-4 rounded-4xl bg-background-muted">
							{Array.from({ length: 3 }).map((_, index) => (
								<Skeleton
									key={index}
									className="h-16 w-full rounded-3xl bg-background"
								/>
							))}
						</div>
					</section>
				</div>
			</section>
		</>
	)
}

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ResourceSkeleton() {
	return (
		<>
			<div className="space-y-4 lg:flex lg:items-center lg:justify-between lg:space-y-0">
				<header className="space-y-1 mb-4 lg:mb-7">
					<div className="flex items-center gap-2">
						<Skeleton className="size-6 lg:size-8 bg-background" />
						<Skeleton className="h-5 w-48 bg-background" />
					</div>
					<Skeleton className="h-5 w-72 bg-background" />
				</header>
				<Skeleton className="h-11 w-40 bg-background" />
			</div>

			<section>
				<div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
					{Array.from({ length: 4 }).map((_, columnIndex) => (
						<Card key={columnIndex}>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<Skeleton className="h-6 w-28 bg-background-muted" />
									<Skeleton className="h-6 w-8 rounded-lg bg-background-muted" />
								</div>
								<Skeleton className="h-1 w-full rounded-full bg-background-muted" />
								<div className="space-y-4">
									{Array.from({ length: 3 }).map((_, cardIndex) => (
										<Skeleton
											key={cardIndex}
											className="h-40 w-full rounded-3xl bg-background-muted"
										/>
									))}
								</div>
							</div>
						</Card>
					))}
				</div>
			</section>
		</>
	)
}

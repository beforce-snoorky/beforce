import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
	return (
		<>
			<header className="space-y-1 mb-4 lg:mb-7">
				<div className="flex items-center gap-2">
					<Skeleton className="size-6 lg:size-8 bg-background" />
					<Skeleton className="h-5 w-48 bg-background" />
				</div>
				<Skeleton className="h-5 w-72 bg-background" />
			</header>

			<section className="grid grid-cols-1 lg:grid-cols-6 gap-4">
				<div className="col-span-1 lg:col-span-3 space-y-4 h-full">
					<Card>
						<div className="flex flex-col justify-between">
							<Skeleton className="h-6 w-40 bg-background-muted" />
							<Skeleton className="mx-auto h-40 w-full" />
							<div className="space-y-2 text-center">
								<Skeleton className="mx-auto h-4 w-72 bg-background-muted" />
								<Skeleton className="mx-auto h-4 w-140 bg-background-muted" />
							</div>
						</div>
					</Card>
				</div>

				<div className="col-span-1 lg:col-span-3 p-4 min-h-64 rounded-4xl bg-linear-145 to-to from-from">
					<div className="flex gap-8">
						<div className="flex flex-col justify-between">
							<div className="space-y-3">
								<Skeleton className="h-6 w-32 bg-white/20" />
								<div className="space-y-1">
									<Skeleton className="h-4 w-40 lg:w-52 bg-white/15" />
									<Skeleton className="h-4 w-32 bg-white/15" />
								</div>
							</div>
							<Skeleton className="h-11 w-40 lg:w-72 bg-white/20" />
						</div>

						<Skeleton className="ml-auto h-56 w-52 bg-white/15" />
					</div>
				</div>

				<div className="col-span-1 lg:col-span-7 mt-4">
					<Skeleton className="h-6 w-52 bg-background" />
					<div className="mt-4 flex flex-col gap-4">
						{Array.from({ length: 7 }).map((_, index) => (
							<Card key={index}>
								<div className="flex items-start justify-between gap-4">
									<div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
										<Skeleton className="h-10 w-10 rounded-xl bg-background-muted" />
										<div className="w-full space-y-2">
											<Skeleton className="h-5 w-36 bg-background-muted" />
											<Skeleton className="h-4 w-96 bg-background-muted" />
										</div>
									</div>
									<Skeleton className="h-11 w-24 bg-background-muted" />
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>
		</>
	)
}

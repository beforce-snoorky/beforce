import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function WebsiteSkeleton() {
	return (
		<section className="space-y-4">
			<div className="mb-7 justify-between space-y-4 lg:flex">
				<header className="space-y-1 mb-4 lg:mb-7">
					<div className="flex items-center gap-2">
						<Skeleton className="size-6 lg:size-8 bg-background" />
						<Skeleton className="h-5 w-48 bg-background" />
					</div>
					<Skeleton className="h-5 w-72 bg-background" />
				</header>

				<Card>
					<div className="lg:w-96 max-sm:space-y-4 lg:flex gap-4">
						<Skeleton className="h-11 w-full bg-background-muted" />
						<Skeleton className="h-11 w-full bg-background-muted" />
					</div>
				</Card>
			</div>

			<div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Card key={index}>
						<>
							<div className="flex items-center gap-2 mb-1">
								<Skeleton className="h-8 w-8 rounded-xl bg-background-muted" />
								<Skeleton className="h-4 w-16 bg-background-muted" />
							</div>
							<Skeleton className="h-4 w-40 bg-background-muted" />
						</>
					</Card>
				))}
			</div>

			<section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{Array.from({ length: 2 }).map((_, index) => (
					<Card key={index}>
						<div className="space-y-3">
							<Skeleton className="h-6 w-40 bg-background-muted" />
							<Skeleton className="h-4 w-56 bg-background-muted" />
							<Skeleton className="h-72 w-full bg-background-muted" />
						</div>
					</Card>
				))}
			</section>

			<section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
				<div className="hidden lg:flex col-span-3 w-full p-4 rounded-4xl bg-background">
					<div className="space-y-2 size-full">
						{Array.from({ length: 5 }).map((_, index) => (
							<div
								key={index}
								className="flex gap-4"
							>
								{Array.from({ length: 4 }).map((_, index) => (
									<Skeleton
										key={index}
										className="h-14 w-full bg-background-muted"
									/>
								))}
							</div>
						))}
					</div>
				</div>

				<div className="md:hidden">
					<Card>
						<div className="flex items-center gap-2 mb-4">
							<Skeleton className="h-6 w-6 bg-background-muted" />
							<Skeleton className="h-4 w-32 bg-background-muted" />
						</div>

						<div className="space-y-2">
							{Array.from({ length: 3 }).map((_, index) => (
								<Skeleton
									key={index}
									className="h-14 w-full bg-background-muted"
								/>
							))}
						</div>
					</Card>
				</div>

				<div className="hidden lg:flex col-span-2 w-full p-4 rounded-4xl bg-background">
					<div className="space-y-2 size-full">
						{Array.from({ length: 5 }).map((_, index) => (
							<div
								key={index}
								className="flex gap-4"
							>
								{Array.from({ length: 3 }).map((_, index) => (
									<Skeleton
										key={index}
										className="h-14 w-full bg-background-muted"
									/>
								))}
							</div>
						))}
					</div>
				</div>

				<div className="md:hidden">
					<Card>
						<div className="flex items-center gap-2 mb-4">
							<Skeleton className="h-6 w-6 bg-background-muted" />
							<Skeleton className="h-4 w-32 bg-background-muted" />
						</div>

						<div className="space-y-2">
							{Array.from({ length: 3 }).map((_, index) => (
								<Skeleton
									key={index}
									className="h-14 w-full bg-background-muted"
								/>
							))}
						</div>
					</Card>
				</div>
			</section>

			<Card>
				<Skeleton className="h-72 w-full bg-background-muted" />
			</Card>
		</section>
	)
}

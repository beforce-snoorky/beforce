import type { CitiesStatisticsProps } from "@/types/website"
import { formatMetricValue, toNumber } from "@/utils/website"
import { ChevronsUpDown, MapPin, MousePointerClick, UserPlus, UsersRound } from "lucide-react"
import { Table, TableCell, TableHead, TableHeader } from "../ui/table"

export function CitiesStatistics({ cities, translate, locale }: CitiesStatisticsProps) {
	return (
		<>
			<div className="md:hidden space-y-2 p-4 rounded-4xl bg-background">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<MapPin className="size-5 text-primary" />
						<h2 className="text-md font-medium">{translate("cities.title")}</h2>
					</div>
					<p className="text-xs text-foreground-muted mb-4">{translate("cities.subtitle")}</p>

					<div className="max-h-70 space-y-2 overflow-y-auto">
						{cities.map((city) => (
							<details
								key={city.city}
								className="rounded-3xl bg-background-muted"
							>
								<summary className="list-none flex items-center justify-between p-4">
									<div className="flex items-center gap-2">
										<div className="size-8 rounded-xl flex items-center justify-center text-primary bg-primary/10">
											<MapPin className="size-5" />
										</div>
										<span className="text-sm leading-tight truncate max-w-52">{city.city}</span>
									</div>
									<ChevronsUpDown className="size-4" />
								</summary>

								<div className="space-y-2 p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className={`size-7 rounded-xl flex items-center justify-center bg-sky-500/10`}>
												<UserPlus className="size-4 text-sky-600" />
											</div>
											<span className="text-xs text-foreground-muted">{translate("cities.newUsers")}</span>
										</div>
										<span className="font-medium">{formatMetricValue(city.newUsers, locale)}</span>
									</div>

									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className={`size-7 rounded-xl flex items-center justify-center bg-emerald-500/10`}>
												<UsersRound className="size-4 text-emerald-600" />
											</div>
											<span className="text-xs text-foreground-muted">{translate("cities.activeUsers")}</span>
										</div>
										<span className="font-medium">{formatMetricValue(city.activeUsers, locale)}</span>
									</div>

									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className={`size-7 rounded-xl flex items-center justify-center bg-violet-500/10`}>
												<MousePointerClick className="size-4 text-violet-600" />
											</div>
											<span className="text-xs text-foreground-muted">{translate("cities.sessions")}</span>
										</div>
										<span className="font-medium">{formatMetricValue(city.engagedSessions, locale)}</span>
									</div>
								</div>
							</details>
						))}
					</div>
				</div>
			</div>

			<div className="hidden md:block col-span-2 overflow-hidden rounded-4xl bg-background">
				<div className="max-h-104 overflow-auto">
					<Table>
						<TableHeader>
							<tr>
								<TableHead>{translate("cities.city")}</TableHead>
								<TableHead>{translate("cities.users")}</TableHead>
								<TableHead>{translate("cities.sessions")}</TableHead>
							</tr>
						</TableHeader>
						<tbody>
							{cities.map((city) => (
								<tr
									key={city.city}
									className="border-t border-border odd:bg-background-muted/60 hover:bg-background-muted"
								>
									<td>
										<div className="w-full flex items-center gap-2 px-4 py-3 whitespace-nowrap">
											<div className="size-7 rounded-xl flex items-center justify-center text-primary bg-primary/10">
												<MapPin className="size-4" />
											</div>
											{city.city}
										</div>
									</td>
									<TableCell width="w-32">
										{formatMetricValue(toNumber(city.newUsers) + toNumber(city.activeUsers), locale)}
									</TableCell>
									<TableCell width="w-32">{formatMetricValue(city.engagedSessions, locale)}</TableCell>
								</tr>
							))}
						</tbody>
					</Table>
				</div>
			</div>
		</>
	)
}

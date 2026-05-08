import type { PagesStatisticsProps } from "@/types/website"
import { buildWebsiteHref, formatMetricValue } from "@/utils/website"
import { BarChart2, ChevronsUpDown, Eye, FileText, UsersRound } from "lucide-react"
import Link from "next/link"
import { Table, TableCell, TableHead, TableHeader } from "../ui/table"

export function PagesStatistics({ site, pages, translate, locale }: PagesStatisticsProps) {
	return (
		<>
			<div className="md:hidden space-y-2 p-4 rounded-4xl bg-background">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<FileText className="size-5 text-primary" />
						<h2 className="text-md font-medium">{translate("pages.title")}</h2>
					</div>
					<p className="text-xs text-foreground-muted mb-4">{translate("pages.subtitle")}</p>

					<div className="max-h-70 space-y-2 overflow-y-auto">
						{pages.map((page) => (
							<details
								key={page.pagePath}
								className="rounded-3xl bg-background-muted"
							>
								<summary className="list-none flex items-center justify-between p-4">
									<div className="flex items-center gap-2">
										<div className="size-8 rounded-xl flex items-center justify-center text-primary bg-primary/10">
											<FileText className="size-5" />
										</div>
										<Link
											href={buildWebsiteHref(site, page.pagePath)}
											target="_blank"
											rel="noopener noreferrer"
											className="truncate max-w-52 font-medium leading-tight"
										>
											{page.pagePath}
										</Link>
									</div>
									<ChevronsUpDown className="size-4" />
								</summary>

								<div className="space-y-2 p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className={`size-7 rounded-xl flex items-center justify-center bg-sky-500/10`}>
												<UsersRound className="size-4 text-sky-600" />
											</div>
											<span className="text-xs text-foreground-muted">{translate("pages.activeUsers")}</span>
										</div>
										<span className="font-medium">{formatMetricValue(page.activeUsers, locale)}</span>
									</div>

									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className={`size-7 rounded-xl flex items-center justify-center bg-emerald-500/10`}>
												<Eye className="size-4 text-emerald-600" />
											</div>
											<span className="text-xs text-foreground-muted">{translate("pages.views")}</span>
										</div>
										<span className="font-medium">{formatMetricValue(page.screenPageViews, locale)}</span>
									</div>

									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className={`size-7 rounded-xl flex items-center justify-center bg-violet-500/10`}>
												<BarChart2 className="size-4 text-violet-600" />
											</div>
											<span className="text-xs text-foreground-muted">{translate("pages.viewsPerUser")}</span>
										</div>
										<span className="font-medium">{formatMetricValue(page.screenPageViewsPerUser, locale)}</span>
									</div>
								</div>
							</details>
						))}
					</div>
				</div>
			</div>

			<div className="hidden md:block col-span-3 overflow-hidden rounded-4xl bg-background">
				<div className="max-h-104 overflow-auto">
					<Table>
						<TableHeader>
							<tr>
								<TableHead>{translate("pages.page")}</TableHead>
								<TableHead>{translate("pages.activeUsers")}</TableHead>
								<TableHead>{translate("pages.views")}</TableHead>
								<TableHead>{translate("pages.viewsPerUser")}</TableHead>
							</tr>
						</TableHeader>
						<tbody>
							{pages.map((page) => (
								<tr
									key={page.pagePath}
									className="border-t border-border odd:bg-background-muted/60 hover:bg-background-muted"
								>
									<td>
										<div className="w-full flex items-center gap-2 px-4 py-3 whitespace-nowrap">
											<div className="size-7 rounded-xl flex items-center justify-center text-primary bg-primary/10">
												<FileText className="size-4" />
											</div>
											<Link
												href={buildWebsiteHref(site, page.pagePath)}
												target="_blank"
												rel="noopener noreferrer"
												className="truncate w-32 max-w-32 block"
											>
												{page.pagePath}
											</Link>
										</div>
									</td>
									<TableCell>{formatMetricValue(page.activeUsers, locale)}</TableCell>
									<TableCell>{formatMetricValue(page.screenPageViews, locale)}</TableCell>
									<TableCell>{formatMetricValue(page.screenPageViewsPerUser, locale)}</TableCell>
								</tr>
							))}
						</tbody>
					</Table>
				</div>
			</div>
		</>
	)
}

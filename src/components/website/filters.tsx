"use client"

import { buildWebsiteHref } from "@/utils/website"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import type { WebsiteFiltersProps } from "@/types/website"
import { Select } from "../ui/select"
import { Card } from "../ui/card"

export function WebsiteFilters({
	monthDraft,
	onMonthChange,
	periodOptions,
	websiteDomain,
	disabled,
	statusText,
	translate,
}: WebsiteFiltersProps) {
	return (
		<Card>
			<div className="space-y-3 w-full lg:min-w-96">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 place-content-center">
					<Select
						name="website-reference-month"
						value={monthDraft || undefined}
						onValueChange={onMonthChange}
						options={periodOptions}
						placeholder={translate("filters.period")}
						disabled={disabled}
					/>

					<Link
						href={buildWebsiteHref(websiteDomain, "/")}
						target="_blank"
						rel="noopener noreferrer"
						className="flex min-h-11 items-center justify-center gap-2 rounded-4xl bg-primary px-4 py-2 text-primary-foreground hover:bg-primary-hover"
					>
						<ExternalLink className="size-5" />
						{translate("actions.visitSite")}
					</Link>
				</div>

				{statusText ? <p className="text-xs text-foreground-muted">{statusText}</p> : null}
			</div>
		</Card>
	)
}

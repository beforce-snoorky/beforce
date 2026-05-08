"use client"

import { confirmCompanySelection } from "@/features/companies"
import type { SelectCompanyResult, UserCompany } from "@/types/companies"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useActionState, useMemo, useState } from "react"
import { Button } from "./ui/button"

const initialState: SelectCompanyResult = { ok: true }

export function CompaniesSelector({ companies, locale }: { companies: UserCompany[]; locale: string }) {
	const translate = useTranslations("Companies")
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [state, formAction, isPending] = useActionState(confirmCompanySelection, initialState)

	const errorMessage = useMemo(() => {
		if (state.ok) return null

		return translate("errorNotMember")
	}, [state, translate])

	return (
		<form
			action={formAction}
			className="space-y-8"
		>
			<input
				type="hidden"
				name="locale"
				value={locale}
			/>
			<input
				type="hidden"
				name="companyId"
				value={selectedId ?? ""}
			/>

			<fieldset>
				<ul
					aria-label={translate("listLabel")}
					role="listbox"
					className="grid grid-cols-2 gap-6 md:flex md:justify-center md:flex-wrap max-h-132 lg:max-h-87 overflow-y-scroll"
				>
					{companies.map((company) => {
						const isSelected = company.id === selectedId

						return (
							<li key={company.id}>
								<button
									type="button"
									role="option"
									aria-selected={isSelected}
									aria-label={company.displayName}
									className={`border text-foreground ${isSelected ? "border-primary bg-primary" : "border-transparent bg-background"}`}
									onClick={() => setSelectedId(company.id)}
								>
									<div className="relative flex items-center justify-center h-20 max-h-20 w-32 max-w-32">
										{company.logoUrl ? (
											<Image
												src={company.logoUrl}
												alt={`logo ${company.displayName}`}
												sizes="80px"
												className="object-cover invert"
												fill
											/>
										) : (
											<span className="font-semibold text-sm">{company.displayName.toUpperCase()}</span>
										)}
									</div>
								</button>
							</li>
						)
					})}
				</ul>
			</fieldset>

			{companies.length > 0 && (
				<div className="flex justify-center">
					<Button
						type="submit"
						variant={selectedId ? "primary" : "secondary"}
						disabled={!selectedId || isPending}
						aria-disabled={!selectedId || isPending}
					>
						{isPending ? translate("confirmLoading") : translate("confirmButton")}
					</Button>
				</div>
			)}

			{errorMessage ? (
				<div
					role="alert"
					className="text-center text-sm text-foreground"
				>
					{errorMessage}
				</div>
			) : null}
		</form>
	)
}

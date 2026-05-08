import type { DigisacFiltersProps } from "@/types/digisac"
import { formatReferenceMonthLabel } from "@/utils/digisac"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Select } from "../ui/select"
import { Card } from "../ui/card"

export function DigisacFilters({
	operatorDraft,
	monthDraft,
	hasAnyMonth,
	isApplying,
	operatorOptions,
	referenceMonths,
	locale,
	translate,
	setOperatorDraft,
	setMonthDraft,
	handleSubmit,
}: DigisacFiltersProps) {
	return (
		<form onSubmit={handleSubmit}>
			<Card>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 place-content-center">
					<Input
						id="digisac-operator"
						name="operatorName"
						list="digisac-options"
						value={operatorDraft}
						onChange={(event) => setOperatorDraft(event.target.value)}
						placeholder={translate("filters.allOperators")}
						autoComplete="off"
						disabled={!hasAnyMonth || isApplying}
					/>
					<datalist id="digisac-options">
						{operatorOptions.map((operatorName) => (
							<option
								key={operatorName}
								value={operatorName}
							/>
						))}
					</datalist>

					<Select
						name="referenceMonth"
						value={monthDraft || undefined}
						onValueChange={setMonthDraft}
						options={referenceMonths.map((referenceMonth) => ({
							value: referenceMonth,
							label: formatReferenceMonthLabel(referenceMonth, locale),
						}))}
						disabled={!hasAnyMonth || isApplying}
					/>

					<Button
						type="submit"
						variant="primary"
						loading={isApplying}
						disabled={!hasAnyMonth || isApplying}
					>
						{translate("filters.apply")}
					</Button>
				</div>
			</Card>
		</form>
	)
}

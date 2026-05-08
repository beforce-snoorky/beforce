import type { EChartsOption } from "echarts-for-react"
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react"

export type ButtonVariant = "primary" | "secondary"

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: ReactNode
	fullWidth?: boolean
	loading?: boolean
	variant: ButtonVariant
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode; error?: boolean; primary?: boolean }

export type SelectOption = { value: string; label: string }

export type SelectProps = {
	options: SelectOption[]
	name: string
	defaultValue?: string
	value?: string
	onValueChange?: (value: string) => void
	placeholder?: string
	icon?: ReactNode
	error?: boolean
	primary?: boolean
	disabled?: boolean
}

export type DropdownPosition = { top: number; left: number; width: number; maxHeight: number; openUp: boolean }

export type DigitalScoreProps = { score: number; activeCount: number; total: number }

export type SafeEChartProps = { option: EChartsOption; height: number }

export type ChartCardProps = { title: string; subtitle: string; icon: ReactNode; children: ReactNode }

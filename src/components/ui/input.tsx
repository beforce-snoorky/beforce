import type { InputProps } from "@/types/ui"

export function Input({ icon, error, primary, ...props }: InputProps) {
	return (
		<div className="relative">
			{icon ? (
				<span className={`absolute left-4 top-1/2 -translate-y-1/2 ${error ? "text-error" : "text-foreground-muted"}`}>
					{icon}
				</span>
			) : null}

			<input
				className={`w-full ${primary ? "bg-background" : "bg-background-muted"} ${icon ? "pl-12" : "pl-4"} ${
					error ? "border-error placeholder:text-error" : ""
				}`}
				{...props}
			/>
		</div>
	)
}

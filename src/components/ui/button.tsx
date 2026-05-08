import { Loader2 } from "lucide-react"
import type { ButtonProps } from "@/types/ui"

export function Button({ children, fullWidth, loading, variant, ...props }: ButtonProps) {
	const variants = { primary: "bg-primary hover:bg-primary-hover", secondary: "bg-background-muted hover:bg-interactive" }

	return (
		<button
			className={`whitespace-nowrap ${fullWidth ? "w-full" : ""} ${variants[variant]}`}
			{...props}
		>
			{loading ? <Loader2 className="size-5 animate-spin" /> : null}
			{children}
		</button>
	)
}

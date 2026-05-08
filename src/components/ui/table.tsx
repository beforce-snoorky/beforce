export function Table({ children }: { children: React.ReactNode }) {
	return <table className="min-w-full text-left text-sm">{children}</table>
}

export function TableHeader({ background, children }: { background?: string; children: React.ReactNode }) {
	return (
		<thead
			className={`sticky top-0 uppercase text-xs tracking-wide text-foreground-muted ${background ? background : "bg-background"}`}
		>
			{children}
		</thead>
	)
}

export function TableHead({ children }: { children: React.ReactNode }) {
	return <th className="px-4 py-3 font-medium">{children}</th>
}

export function TableCell({ width, children }: { width?: string; children: React.ReactNode }) {
	return (
		<td>
			<div className={`${width} px-4 py-5 whitespace-nowrap`}>{children}</div>
		</td>
	)
}

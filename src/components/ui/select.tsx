"use client"

import type { DropdownPosition, SelectProps } from "@/types/ui"
import { ChevronsUpDown } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

export function Select({
	options,
	name,
	defaultValue,
	value,
	onValueChange,
	icon,
	error,
	primary,
	disabled,
	placeholder = "Selecione...",
}: SelectProps) {
	const [open, setOpen] = useState(false)
	const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null)
	const [internalValue, setInternalValue] = useState<string | undefined>(undefined)
	const canUsePortal = typeof document !== "undefined"
	const isControlled = typeof value !== "undefined"
	const selectedValue = isControlled ? value : (internalValue ?? defaultValue)

	const containerRef = useRef<HTMLDivElement>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const selected = options.find((opt) => opt.value === selectedValue)

	const updateDropdownPosition = useCallback(() => {
		if (!triggerRef.current) return

		const rect = triggerRef.current.getBoundingClientRect()
		const viewportPadding = 8
		const dropdownGap = 4
		const viewportHeight = window.innerHeight
		const availableBelow = viewportHeight - rect.bottom - viewportPadding
		const availableAbove = rect.top - viewportPadding
		const openUp = availableBelow < 220 && availableAbove > availableBelow
		const maxHeight = Math.max(120, Math.min(320, openUp ? availableAbove : availableBelow))

		setDropdownPosition({
			top: openUp ? rect.top - dropdownGap : rect.bottom + dropdownGap,
			left: rect.left,
			width: rect.width,
			maxHeight,
			openUp,
		})
	}, [])

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			const targetNode = e.target as Node
			if (containerRef.current?.contains(targetNode)) return
			if (dropdownRef.current?.contains(targetNode)) return
			setOpen(false)
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [])

	useEffect(() => {
		if (!open || disabled) return

		updateDropdownPosition()

		function handleViewportChange() {
			updateDropdownPosition()
		}

		window.addEventListener("resize", handleViewportChange)
		window.addEventListener("scroll", handleViewportChange, true)

		return () => {
			window.removeEventListener("resize", handleViewportChange)
			window.removeEventListener("scroll", handleViewportChange, true)
		}
	}, [open, disabled, updateDropdownPosition])

	return (
		<div
			ref={containerRef}
			className="relative w-full"
		>
			<input
				type="hidden"
				name={name}
				value={selectedValue ?? ""}
			/>

			<button
				id="select"
				type="button"
				ref={triggerRef}
				disabled={disabled}
				className={`w-full ${primary ? "bg-background" : "bg-background-muted"}
				   ${error ? "border-error placeholder:text-error" : ""}
				   ${disabled ? "opacity-60 cursor-not-allowed" : ""}
				`}
				onClick={() =>
					setOpen((prev) => {
						const nextOpen = !prev
						if (nextOpen) updateDropdownPosition()
						return nextOpen
					})
				}
			>
				{icon && <span className="text-foreground-muted">{icon}</span>}

				{selected ? (
					<div className="flex items-center gap-2">
						<span>{selected.label}</span>
					</div>
				) : (
					<span className="text-foreground-muted">{placeholder}</span>
				)}

				<span className="ml-auto">
					<ChevronsUpDown className="size-4" />
				</span>
			</button>

			{open && !disabled && canUsePortal && dropdownPosition
				? createPortal(
						<div
							ref={dropdownRef}
							className="fixed z-70"
							style={{
								top: dropdownPosition.top,
								left: dropdownPosition.left,
								width: dropdownPosition.width,
								transform: dropdownPosition.openUp ? "translateY(-100%)" : undefined,
							}}
						>
							<div className="w-full rounded-3xl bg-background p-2 shadow-md border border-border">
								<ul
									className="flex flex-col gap-1 overflow-auto"
									style={{ maxHeight: dropdownPosition.maxHeight }}
								>
									{options.map((opt) => (
										<li key={opt.value}>
											<button
												type="button"
												onClick={() => {
													if (!isControlled) setInternalValue(opt.value)
													onValueChange?.(opt.value)
													setOpen(false)
												}}
												className="w-full flex items-center gap-2 p-2 rounded-4xl hover:bg-background-muted text-left"
											>
												<span className="text-foreground">{opt.label}</span>
											</button>
										</li>
									))}
								</ul>
							</div>
						</div>,
						document.body
					)
				: null}
		</div>
	)
}

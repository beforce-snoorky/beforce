"use client"

import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import type { LocaleSwitcherProps } from "@/types/sidebar"
import { ChevronDown } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

export type { LocaleSwitcherProps } from "@/types/sidebar"

export function LocaleSwitcher({ href, collapse, variant }: LocaleSwitcherProps) {
	const locale = useLocale()
	const translate = useTranslations("Language")

	const [open, setOpen] = useState(false)

	const getLabel = (item: string) => (item === "pt" ? translate("pt") : translate("en"))

	const variants = { primary: "bg-background", secondary: "" }

	return (
		<div className="relative">
			<div
				className={`w-full flex items-center gap-2 p-2 rounded-4xl cursor-pointer ${variants[variant]} ${collapse ? "" : "px-4"}`}
				onClick={() => setOpen((prev) => !prev)}
			>
				<div className="size-5">{locale === "pt" ? <BrazilFlag /> : <UnitedStatesFlag />}</div>
				{!collapse && <span>{getLabel(locale)}</span>}
				<ChevronDown className={`size-4 text-foreground-muted ${open ? "rotate-180" : ""}`} />
			</div>

			{open ? (
				<div
					className={`absolute p-2 rounded-3xl bg-background ${collapse ? "bottom-0 left-full ml-1" : "bottom-full w-full mb-1"}`}
				>
					<ul className="flex flex-col gap-1">
						{routing.locales.map((item) => {
							const label = getLabel(item)

							return (
								<li key={item}>
									<Link
										href={href}
										locale={item}
										prefetch={false}
										className="w-full flex items-center gap-2 p-1 pr-2 rounded-4xl hover:bg-background-muted"
										onClick={() => setOpen(false)}
									>
										<div className="size-5">{item === "pt" ? <BrazilFlag /> : <UnitedStatesFlag />}</div>
										<span>{label}</span>
									</Link>
								</li>
							)
						})}
					</ul>
				</div>
			) : null}
		</div>
	)
}

export function BrazilFlag() {
	return (
		<svg viewBox="0 0 512 512">
			<circle
				cx="256"
				cy="256"
				r="256"
				fill="#6da544"
			/>
			<path
				fill="#ffda44"
				d="M256 100.174 467.478 256 256 411.826 44.522 256z"
			/>
			<circle
				cx="256"
				cy="256"
				r="89.043"
				fill="#f0f0f0"
			/>
			<path
				fill="#0052b4"
				d="M211.478 250.435c-15.484 0-30.427 2.355-44.493 6.725.623 48.64 40.227 87.884 89.015 87.884 30.168 0 56.812-15.017 72.919-37.968-27.557-34.497-69.958-56.641-117.441-56.641zM343.393 273.06a89.45 89.45 0 0 0 1.651-17.06c0-49.178-39.866-89.043-89.043-89.043-36.694 0-68.194 22.201-81.826 53.899a183.693 183.693 0 0 1 37.305-3.812c51.717-.001 98.503 21.497 131.913 56.016z"
			/>
		</svg>
	)
}

export function UnitedStatesFlag() {
	return (
		<svg viewBox="0 0 512 512">
			<circle
				cx="256"
				cy="256"
				r="256"
				fill="#f0f0f0"
			/>
			<path
				fill="#d80027"
				d="M244.87 256H512c0-23.106-3.08-45.49-8.819-66.783H244.87zM244.87 122.435h229.556a257.35 257.35 0 0 0-59.07-66.783H244.87zM256 512c60.249 0 115.626-20.824 159.356-55.652H96.644C140.374 491.176 195.751 512 256 512zM37.574 389.565h436.852a254.474 254.474 0 0 0 28.755-66.783H8.819a254.474 254.474 0 0 0 28.755 66.783z"
			/>
			<path
				fill="#0052b4"
				d="M118.584 39.978h23.329l-21.7 15.765 8.289 25.509-21.699-15.765-21.699 15.765 7.16-22.037a257.407 257.407 0 0 0-49.652 55.337h7.475l-13.813 10.035a255.58 255.58 0 0 0-6.194 10.938l6.596 20.301-12.306-8.941a253.567 253.567 0 0 0-8.372 19.873l7.267 22.368h26.822l-21.7 15.765 8.289 25.509-21.699-15.765-12.998 9.444A258.468 258.468 0 0 0 0 256h256V0c-50.572 0-97.715 14.67-137.416 39.978zm9.918 190.422-21.699-15.765L85.104 230.4l8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822l-21.7 15.765zm-8.289-100.083 8.289 25.509-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822zM220.328 230.4l-21.699-15.765L176.93 230.4l8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822l-21.7 15.765zm-8.289-100.083 8.289 25.509-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822zm0-74.574 8.289 25.509-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822z"
			/>
		</svg>
	)
}

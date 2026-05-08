"use client"

import type { WorldMapProps } from "@/types/website"
import { countryNameToCode } from "@/utils/website"
import { useEffect, useState } from "react"

export function WorldMap({ country, translate: _translate, locale: _locale }: WorldMapProps) {
	const [svgContent, setSvgContent] = useState<string>("")
	const activeCountryCodes = country.map((countryItem) => countryNameToCode[countryItem.country]).filter(Boolean)

	useEffect(() => {
		const fetchSvg = async () => {
			const res = await fetch("/images/world.svg")
			const text = await res.text()
			setSvgContent(text)
		}

		fetchSvg()
	}, [])

	useEffect(() => {
		if (!svgContent) return

		const timeout = setTimeout(() => {
			activeCountryCodes.forEach((countryCode) => {
				const countryElement = document.querySelector(`.${countryCode}`)
				if (countryElement) {
					const element = countryElement as HTMLElement
					element.style.fill = "#fa0d1d"
					element.style.stroke = "#fa0d1d"
				}
			})
		}, 0)

		return () => clearTimeout(timeout)
	}, [svgContent, activeCountryCodes])

	return (
		<div className="rounded-4xl bg-background">
			<div
				dangerouslySetInnerHTML={{ __html: svgContent }}
				className="w-full h-full"
			/>
		</div>
	)
}

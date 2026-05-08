"use client"

import type { SafeEChartProps } from "@/types/ui"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false })

export function SafeEChart({ option, height }: SafeEChartProps) {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const [canRenderChart, setCanRenderChart] = useState(false)

	useEffect(() => {
		const container = containerRef.current
		if (!container) return

		const resizeObserver = new ResizeObserver((entries) => {
			const width = entries[0]?.contentRect.width ?? 0
			setCanRenderChart(width > 0)
		})

		resizeObserver.observe(container)
		return () => resizeObserver.disconnect()
	}, [])

	return (
		<div
			ref={containerRef}
			style={{ width: "100%", minHeight: height }}
		>
			{canRenderChart ? (
				<ReactECharts
					option={option}
					style={{ height, width: "100%" }}
				/>
			) : null}
		</div>
	)
}

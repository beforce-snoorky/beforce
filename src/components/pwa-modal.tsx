"use client"

import { Button } from "@/components/ui/button"
import { BellRing, Download, Smartphone } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

const PWA_DISMISSED_STORAGE_KEY = "pwa-dismissed"

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>
	userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

function isMobileDevice(userAgent: string): boolean {
	return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent)
}

function isIosDevice(userAgent: string): boolean {
	return /iPad|iPhone|iPod/i.test(userAgent)
}

function isStandaloneMode(): boolean {
	if (typeof window === "undefined") return false

	const standaloneNavigator = navigator as Navigator & { standalone?: boolean }

	return window.matchMedia("(display-mode: standalone)").matches || standaloneNavigator.standalone === true
}

export function PwaInstallModal() {
	const translate = useTranslations("PwaInstall")
	const [shouldShow, setShouldShow] = useState(false)
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
	const [isIos, setIsIos] = useState(false)
	const dialogRef = useRef<HTMLDivElement>(null)
	const instructionsRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (typeof window === "undefined") return

		const frameId = window.requestAnimationFrame(() => {
			const userAgent = navigator.userAgent
			const dismissed = window.localStorage.getItem(PWA_DISMISSED_STORAGE_KEY) === "true"
			const isMobile = isMobileDevice(userAgent)
			const standalone = isStandaloneMode()
			const iosDevice = isIosDevice(userAgent)

			setIsIos(iosDevice)
			setShouldShow(isMobile && !standalone && !dismissed)
		})

		return () => window.cancelAnimationFrame(frameId)
	}, [])

	useEffect(() => {
		if (typeof window === "undefined") return

		function handleBeforeInstallPrompt(event: Event) {
			const installPromptEvent = event as BeforeInstallPromptEvent
			installPromptEvent.preventDefault()
			setDeferredPrompt(installPromptEvent)
		}

		function handleAppInstalled() {
			window.localStorage.setItem(PWA_DISMISSED_STORAGE_KEY, "true")
			setDeferredPrompt(null)
			setShouldShow(false)
		}

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
		window.addEventListener("appinstalled", handleAppInstalled)

		return () => {
			window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
			window.removeEventListener("appinstalled", handleAppInstalled)
		}
	}, [])

	useEffect(() => {
		if (!shouldShow) return
		dialogRef.current?.focus()
	}, [shouldShow])

	useEffect(() => {
		if (!shouldShow || typeof window === "undefined") return

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key !== "Escape") return
			window.localStorage.setItem(PWA_DISMISSED_STORAGE_KEY, "true")
			setShouldShow(false)
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [shouldShow])

	if (!shouldShow) return null

	async function handleInstallApp() {
		if (isIos) {
			instructionsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
			return
		}

		if (!deferredPrompt) return

		const promptEvent = deferredPrompt
		setDeferredPrompt(null)

		await promptEvent.prompt()
		const choice = await promptEvent.userChoice

		if (choice.outcome === "accepted") {
			window.localStorage.setItem(PWA_DISMISSED_STORAGE_KEY, "true")
			setShouldShow(false)
		}
	}

	function handleContinueInBrowser() {
		window.localStorage.setItem(PWA_DISMISSED_STORAGE_KEY, "true")
		setShouldShow(false)
	}

	const benefits = [
		{ icon: <Download className="size-4 text-primary" />, text: translate("benefits.fasterAccess") },
		{ icon: <BellRing className="size-4 text-primary" />, text: translate("benefits.betterNotifications") },
		{ icon: <Smartphone className="size-4 text-primary" />, text: translate("benefits.fullscreenExperience") },
	]

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="pwa-install-title"
				aria-describedby="pwa-install-description"
				tabIndex={-1}
				className="w-full max-w-sm rounded-4xl bg-background p-4 shadow-2xl"
			>
				<div className="space-y-4">
					<div className="flex items-center gap-4">
						<div className="flex size-16 items-center justify-center rounded-2xl bg-background-muted">
							<Image
								src="/icons/icon-192.png"
								alt={translate("iconAlt")}
								width={56}
								height={56}
								className="rounded-2xl"
								sizes="56px"
							/>
						</div>

						<div className="space-y-1 w-72">
							<h2 className="text-lg font-semibold tracking-tight">{translate("headline")}</h2>
							<p className="text-sm text-foreground-muted">{translate("description")}</p>
						</div>
					</div>

					<ul className="space-y-2">
						{benefits.map((benefit, index) => (
							<li
								key={index}
								className="flex items-center gap-4 rounded-4xl bg-background-muted p-2"
							>
								<div className="flex size-8 items-center justify-center rounded-3xl bg-background">{benefit.icon}</div>
								<span className="w-64 text-sm text-foreground">{benefit.text}</span>
							</li>
						))}
					</ul>

					<div className="space-y-3">
						<Button
							type="button"
							variant="primary"
							fullWidth
							disabled={!isIos && !deferredPrompt}
							onClick={() => void handleInstallApp()}
						>
							{translate("actions.install")}
						</Button>

						<Button
							type="button"
							variant="secondary"
							fullWidth
							onClick={handleContinueInBrowser}
						>
							{translate("actions.continueInBrowser")}
						</Button>

						<p className="text-xs text-center max-w-64 mx-auto text-foreground-muted">
							{isIos
								? translate("status.iosHint")
								: deferredPrompt
									? translate("status.androidReady")
									: translate("status.androidPreparing")}
						</p>
					</div>

					<div
						ref={instructionsRef}
						className="rounded-[1.75rem] bg-background-muted p-4"
					>
						<div className="flex items-center gap-2">
							<Download className="size-4 text-primary" />
							<h3 className="text-sm font-semibold tracking-tight">{translate("instructions.title")}</h3>
						</div>

						{isIos ? (
							<ol className="mt-3 space-y-2 text-sm text-foreground-muted">
								<li>1. {translate("instructions.ios.stepOne")}</li>
								<li>2. {translate("instructions.ios.stepTwo")}</li>
								<li>3. {translate("instructions.ios.stepThree")}</li>
							</ol>
						) : (
							<ol className="mt-3 space-y-2 text-sm text-foreground-muted">
								<li>1. {translate("instructions.android.stepOne")}</li>
								<li>2. {translate("instructions.android.stepTwo")}</li>
								<li>3. {translate("instructions.android.stepThree")}</li>
							</ol>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

"use client"

import { subscribeUser, unsubscribeUser } from "@/app/actions/push"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { Card } from "./ui/card"

const DEBUG_PUSH = process.env.NODE_ENV === "development"
const SERVICE_WORKER_READY_TIMEOUT_MS = 10_000

type PushFeedbackCode =
	| "secure_context_required"
	| "standalone_required"
	| "push_unsupported"
	| "service_worker_failed"
	| "permission_denied"
	| "subscription_failed"
	| "invalid_subscription"
	| "backend_failed"

type ValidatedPushSubscriptionPayload = {
	endpoint: string
	expirationTime: number | null
	keys: { auth: string; p256dh: string }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
	const rawData = window.atob(base64)
	const outputArray: Uint8Array<ArrayBuffer> = new Uint8Array(new ArrayBuffer(rawData.length))

	for (let index = 0; index < rawData.length; index += 1) {
		outputArray[index] = rawData.charCodeAt(index)
	}

	return outputArray
}

function canUsePushNotifications(): boolean {
	if (typeof window === "undefined") return false
	return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
}

function isIOS(): boolean {
	if (typeof navigator === "undefined") return false
	return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function isStandalone(): boolean {
	if (typeof window === "undefined") return false

	const standaloneNavigator = navigator as Navigator & { standalone?: boolean }

	return window.matchMedia("(display-mode: standalone)").matches || standaloneNavigator.standalone === true
}

function getPushEnvironmentBlockCode(): PushFeedbackCode | null {
	if (typeof window === "undefined") return null
	if (!window.isSecureContext) return "secure_context_required"
	if (isIOS() && !isStandalone()) return "standalone_required"
	if (!("PushManager" in window)) return "push_unsupported"
	if (!("Notification" in window)) return "push_unsupported"
	if (!("serviceWorker" in navigator) || !navigator.serviceWorker) return "push_unsupported"
	return null
}

function getErrorName(error: unknown): string {
	if (error instanceof Error && error.name) return error.name
	if (error && typeof error === "object" && typeof Reflect.get(error, "name") === "string")
		return String(Reflect.get(error, "name"))
	return "UnknownError"
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) return error.message
	if (typeof error === "string") return error
	if (error && typeof error === "object" && typeof Reflect.get(error, "message") === "string")
		return String(Reflect.get(error, "message"))
	return "Unknown push error."
}

function logPushStep(step: string, details?: Record<string, unknown>) {
	if (!DEBUG_PUSH) return
	console.log("[push]", step, details ?? {})
}

function logPushError(step: string, error: unknown, details?: Record<string, unknown>) {
	const payload = { ...details, name: getErrorName(error), message: getErrorMessage(error) }

	if (DEBUG_PUSH) {
		console.error(`[push] ${step}`, { ...payload, error })
		return
	}

	console.error(`[push] ${step}`, payload)
}

function isCommonIOSSubscribeError(error: unknown): boolean {
	if (!isIOS()) return false

	const name = getErrorName(error)
	const message = getErrorMessage(error).toLowerCase()

	return (
		name === "AbortError" ||
		name === "NotAllowedError" ||
		name === "InvalidStateError" ||
		message.includes("abort") ||
		message.includes("permission") ||
		message.includes("standalone")
	)
}

function validateSubscriptionPayload(subscription: PushSubscription): ValidatedPushSubscriptionPayload {
	const payload = subscription.toJSON()
	const endpoint = payload.endpoint?.trim()
	const auth = payload.keys?.auth?.trim()
	const p256dh = payload.keys?.p256dh?.trim()

	if (!endpoint || !auth || !p256dh) throw new Error("Push subscription payload is missing endpoint or keys.")

	return { endpoint, expirationTime: payload.expirationTime ?? null, keys: { auth, p256dh } }
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
	if (!("serviceWorker" in navigator) || !navigator.serviceWorker) throw new Error("Service Worker API unavailable.")

	logPushStep("service_worker_lookup_started")

	const existingRegistration = await navigator.serviceWorker.getRegistration()
	let registration = existingRegistration

	if (!registration) {
		logPushStep("service_worker_register_started", { scope: "/" })
		registration = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
	}

	const activatedRegistration = await waitForActiveServiceWorker(registration)
	const readyRegistration = await Promise.race<ServiceWorkerRegistration | null>([
		navigator.serviceWorker.ready,
		new Promise<null>((resolve) => {
			window.setTimeout(() => resolve(null), SERVICE_WORKER_READY_TIMEOUT_MS)
		}),
	])

	if (!readyRegistration) logPushStep("service_worker_ready_timeout")

	const resolvedRegistration = readyRegistration ?? activatedRegistration ?? (await navigator.serviceWorker.getRegistration())
	const activeRegistration = resolvedRegistration ? await waitForActiveServiceWorker(resolvedRegistration) : null

	if (!activeRegistration?.active) throw new Error("Service worker is not active.")

	logPushStep("service_worker_ready", { scope: activeRegistration.scope })

	return activeRegistration
}

async function waitForActiveServiceWorker(registration: ServiceWorkerRegistration): Promise<ServiceWorkerRegistration | null> {
	if (registration.active?.state === "activated") return registration

	const worker = registration.installing ?? registration.waiting ?? registration.active

	if (worker) {
		await new Promise<void>((resolve) => {
			if (worker.state === "activated") {
				resolve()
				return
			}

			const handleStateChange = () => {
				if (worker.state !== "activated") return
				worker.removeEventListener("statechange", handleStateChange)
				resolve()
			}

			worker.addEventListener("statechange", handleStateChange)

			window.setTimeout(() => {
				worker.removeEventListener("statechange", handleStateChange)
				resolve()
			}, 5000)
		})
	}

	const latestRegistration = await navigator.serviceWorker.getRegistration()
	if (latestRegistration?.active?.state === "activated") return latestRegistration
	if (registration.active) return registration
	if (latestRegistration?.active) return latestRegistration

	return registration.active ? registration : null
}

export function PwaStatus() {
	const translate = useTranslations("Settings.pwa")
	const [isPushSupported, setIsPushSupported] = useState(false)
	const [subscription, setSubscription] = useState<PushSubscription | null>(null)
	const [feedback, setFeedback] = useState<string | null>(null)
	const [isBusy, setIsBusy] = useState(false)
	const [environmentBlockCode, setEnvironmentBlockCode] = useState<PushFeedbackCode | null>(null)

	function resolveFeedbackMessage(code: PushFeedbackCode): string {
		switch (code) {
			case "secure_context_required":
				return translate("errors.secureContextRequired")
			case "standalone_required":
				return translate("errors.standaloneRequired")
			case "push_unsupported":
				return translate("unsupported")
			case "service_worker_failed":
				return translate("errors.serviceWorkerUnavailable")
			case "permission_denied":
				return translate("states.permissionDenied")
			case "subscription_failed":
				return translate("errors.subscriptionFailed")
			case "invalid_subscription":
				return translate("errors.invalidSubscription")
			case "backend_failed":
				return translate("errors.backendFailed")
		}
	}

	useEffect(() => {
		if (typeof window === "undefined") return

		let isMounted = true

		async function syncPushState() {
			const blockCode = getPushEnvironmentBlockCode()
			const pushSupported = canUsePushNotifications()
			if (!isMounted) return

			setIsPushSupported(pushSupported)
			setEnvironmentBlockCode(blockCode)

			if (blockCode) {
				logPushStep("environment_blocked", { code: blockCode, isIOS: isIOS(), standalone: isStandalone() })
				setSubscription(null)
				return
			}

			if (!pushSupported) {
				setSubscription(null)
				return
			}

			try {
				const registration = await getServiceWorkerRegistration()
				if (!isMounted) return

				const currentSubscription = await registration.pushManager.getSubscription()
				if (!isMounted) return

				logPushStep("subscription_state_synced", { hasSubscription: Boolean(currentSubscription) })
				setSubscription(currentSubscription)
			} catch (error) {
				logPushError("sync_push_state_failed", error)
				if (!isMounted) return
				setSubscription(null)
			}
		}

		void syncPushState().catch((error) => {
			if (!isMounted) return
			logPushError("sync_push_state_unhandled", error)
			setSubscription(null)
		})

		return () => {
			isMounted = false
		}
	}, [])

	async function handleSubscribe() {
		if (isBusy) return

		const blockCode = getPushEnvironmentBlockCode()
		setEnvironmentBlockCode(blockCode)

		if (blockCode) {
			setFeedback(resolveFeedbackMessage(blockCode))
			return
		}

		if (!isPushSupported) {
			setFeedback(resolveFeedbackMessage("push_unsupported"))
			return
		}

		const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
		if (!vapidPublicKey) {
			setFeedback(translate("errors.missingVapidPublicKey"))
			return
		}

		setIsBusy(true)
		setFeedback(null)

		let registration: ServiceWorkerRegistration

		try {
			logPushStep("service_worker_ready_started")
			registration = await getServiceWorkerRegistration()
		} catch (error) {
			logPushError("service_worker_failed", error)
			setFeedback(resolveFeedbackMessage("service_worker_failed"))
			setIsBusy(false)
			return
		}

		let notificationPermission: NotificationPermission

		try {
			logPushStep("permission_request_started", { currentPermission: Notification.permission })
			notificationPermission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission()
			logPushStep("permission_request_completed", { notificationPermission })
		} catch (error) {
			logPushError("permission_request_failed", error)
			setFeedback(resolveFeedbackMessage("permission_denied"))
			setIsBusy(false)
			return
		}

		if (notificationPermission !== "granted") {
			setFeedback(resolveFeedbackMessage("permission_denied"))
			setIsBusy(false)
			return
		}

		let nextSubscription: PushSubscription | null = null

		try {
			logPushStep("existing_subscription_check_started")
			nextSubscription = await registration.pushManager.getSubscription()
			logPushStep("existing_subscription_check_completed", { hasExistingSubscription: Boolean(nextSubscription) })
		} catch (error) {
			logPushError("existing_subscription_check_failed", error)
			setFeedback(resolveFeedbackMessage("subscription_failed"))
			setIsBusy(false)
			return
		}

		if (!nextSubscription) {
			try {
				logPushStep("push_subscribe_started", { isIOS: isIOS(), standalone: isStandalone() })
				nextSubscription = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
				})
				logPushStep("push_subscribe_completed", { hasSubscription: Boolean(nextSubscription) })
			} catch (error) {
				const details = {
					name: getErrorName(error),
					message: getErrorMessage(error),
					isIOS: isIOS(),
					standalone: isStandalone(),
					commonIOSError: isCommonIOSSubscribeError(error),
				}

				if (DEBUG_PUSH) {
					console.error("[push] subscribe failed", { ...details, error })
				} else {
					console.error("[push] subscribe failed", details)
				}

				setFeedback(resolveFeedbackMessage("subscription_failed"))
				setIsBusy(false)
				return
			}
		}

		if (!nextSubscription) {
			setFeedback(resolveFeedbackMessage("subscription_failed"))
			setIsBusy(false)
			return
		}

		let subscriptionPayload: ValidatedPushSubscriptionPayload

		try {
			logPushStep("subscription_validation_started")
			subscriptionPayload = validateSubscriptionPayload(nextSubscription)
			logPushStep("subscription_validation_completed", { endpointLength: subscriptionPayload.endpoint.length })
		} catch (error) {
			logPushError("subscription_validation_failed", error)
			setFeedback(resolveFeedbackMessage("invalid_subscription"))
			setIsBusy(false)
			return
		}

		try {
			logPushStep("backend_persistence_started")
			const result = await subscribeUser(subscriptionPayload)

			if (!result.ok) {
				logPushError("backend_failed", new Error(result.message), { code: result.code })
				setFeedback(resolveFeedbackMessage(result.code === "invalid_subscription" ? "invalid_subscription" : "backend_failed"))
				setIsBusy(false)
				return
			}

			logPushStep("backend_persistence_completed")
			setSubscription(nextSubscription)
			setFeedback(translate("states.subscribed"))
		} catch (error) {
			logPushError("backend_failed", error)
			setFeedback(resolveFeedbackMessage("backend_failed"))
		} finally {
			setIsBusy(false)
		}
	}

	async function handleUnsubscribe() {
		if (!subscription || isBusy) return

		setIsBusy(true)
		setFeedback(null)

		try {
			await subscription.unsubscribe()
			await unsubscribeUser(subscription.endpoint)
			setSubscription(null)
			setFeedback(translate("states.unsubscribed"))
		} catch (error) {
			logPushError("unsubscribe_failed", error)
			setFeedback(translate("errors.unsubscribeFailed"))
		} finally {
			setIsBusy(false)
		}
	}

	async function handleToggleNotifications() {
		if (subscription) {
			await handleUnsubscribe()
			return
		}

		await handleSubscribe()
	}

	const availabilityMessage = environmentBlockCode
		? resolveFeedbackMessage(environmentBlockCode)
		: !isPushSupported
			? translate("unsupported")
			: null
	const isSubscriptionBlocked = Boolean(environmentBlockCode)

	return (
		<Card>
			<div className="space-y-1">
				<h2 className="text-lg font-semibold tracking-tight">{translate("title")}</h2>
				<p className="text-sm text-foreground-muted">{translate("description")}</p>
			</div>

			<div className="mt-4 rounded-4xl bg-background-muted p-4 space-y-4 text-center">
				{availabilityMessage ? <p className="text-sm text-foreground-muted">{availabilityMessage}</p> : null}

				<Button
					type="button"
					variant={subscription ? "secondary" : "primary"}
					disabled={!isPushSupported || isSubscriptionBlocked || isBusy}
					loading={isBusy}
					fullWidth
					onClick={() => void handleToggleNotifications()}
				>
					{subscription ? translate("push.unsubscribe") : translate("push.subscribe")}
				</Button>

				<p className="text-sm text-foreground-muted">{translate("helper")}</p>
			</div>

			{feedback ? (
				<p
					className="text-sm text-foreground-muted"
					role="status"
					aria-live="polite"
				>
					{feedback}
				</p>
			) : null}
		</Card>
	)
}

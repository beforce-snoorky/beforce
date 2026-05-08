"use server"

import { requireUser } from "@/features/auth"
import { createSupabaseAdminClient } from "@/supabase/admin"
import webpush from "web-push"

type PushSubscriptionPayload = { endpoint: string; expirationTime: number | null; keys: { auth: string; p256dh: string } }
type PushActionFailureCode = "invalid_subscription" | "backend_failed"
type PushActionSuccess = { ok: true }
type PushActionFailure = { ok: false; code: PushActionFailureCode; message: string }

type SendMonthlyNotificationResult = { delivered: number; removed: number }
type SendTestNotificationResult = { delivered: number; removed: number }

const PUSH_CONTACT = "mailto:suporte@beforce.com.br"
const DEFAULT_TITLE = "Novo relatório mensal"
const DEFAULT_BODY = "Seu relatório mensal está disponível"
const DEFAULT_ICON = "/icons/icon-192.png"
const DEBUG_PUSH = process.env.NODE_ENV === "development"

function getVapidPublicKey(): string {
	const value = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
	if (!value) throw new Error("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY.")
	return value
}

function getVapidPrivateKey(): string {
	const value = process.env.VAPID_PRIVATE_KEY
	if (!value) throw new Error("Missing VAPID_PRIVATE_KEY.")
	return value
}

let vapidConfigured = false

function ensureWebPushConfiguration(): void {
	if (vapidConfigured) return

	webpush.setVapidDetails(PUSH_CONTACT, getVapidPublicKey(), getVapidPrivateKey())
	vapidConfigured = true
}

function isSubscriptionObject(value: unknown): value is PushSubscriptionPayload {
	if (!value || typeof value !== "object") return false

	const endpoint = Reflect.get(value, "endpoint")
	const expirationTime = Reflect.get(value, "expirationTime")
	const keys = Reflect.get(value, "keys")

	if (typeof endpoint !== "string" || endpoint.trim().length === 0) return false
	if (!(expirationTime === null || typeof expirationTime === "number")) return false
	if (!keys || typeof keys !== "object") return false
	if (typeof Reflect.get(keys, "auth") !== "string") return false
	if (typeof Reflect.get(keys, "p256dh") !== "string") return false

	return true
}

function normalizeMonthlyMessage(message: string): string {
	const normalized = message.trim()
	if (normalized.length === 0) return DEFAULT_BODY
	return normalized
}

function isSubscriptionGoneError(error: unknown): boolean {
	if (!error || typeof error !== "object") return false
	const statusCode = Reflect.get(error, "statusCode")
	return statusCode === 404 || statusCode === 410
}

function getServerErrorDetails(error: unknown): { name: string; message: string; code?: string } {
	if (error instanceof Error) return { name: error.name, message: error.message }

	if (error && typeof error === "object") {
		const name = typeof Reflect.get(error, "name") === "string" ? String(Reflect.get(error, "name")) : "Error"
		const message = typeof Reflect.get(error, "message") === "string" ? String(Reflect.get(error, "message")) : String(error)
		const code = typeof Reflect.get(error, "code") === "string" ? String(Reflect.get(error, "code")) : undefined

		return { name, message, code }
	}

	return { name: "Error", message: String(error) }
}

function logPushServerError(message: string, error: unknown, details?: Record<string, unknown>) {
	const payload = { ...details, ...getServerErrorDetails(error) }

	if (DEBUG_PUSH) {
		console.error(message, { ...payload, error })
		return
	}

	console.error(message, payload)
}

function createSubscribeFailure(code: PushActionFailureCode, message: string): PushActionFailure {
	return { ok: false, code, message }
}

export async function subscribeUser(subscription: unknown): Promise<PushActionSuccess | PushActionFailure> {
	if (!isSubscriptionObject(subscription)) {
		const message = "Invalid push subscription payload."
		logPushServerError("[push] invalid subscription payload", new Error(message))
		return createSubscribeFailure("invalid_subscription", message)
	}

	try {
		const user = await requireUser()
		const supabase = createSupabaseAdminClient()

		const { data: existingSubscriptions, error: selectError } = await supabase
			.from("push_subscriptions")
			.select("id, endpoint")
			.eq("user_id", user.id)

		if (selectError) {
			logPushServerError("[push] supabase select failed", selectError, { endpoint: subscription.endpoint })
			return createSubscribeFailure("backend_failed", `Unable to read existing push subscriptions. (${selectError.message})`)
		}

		const existingSubscription = existingSubscriptions?.find((row) => row.endpoint === subscription.endpoint) ?? null

		if (existingSubscription) {
			const { error: updateError } = await supabase
				.from("push_subscriptions")
				.update({ subscription })
				.eq("id", existingSubscription.id)

			if (updateError) {
				logPushServerError("[push] supabase update failed", updateError, {
					endpoint: subscription.endpoint,
					subscriptionId: existingSubscription.id,
				})
				return createSubscribeFailure("backend_failed", `Unable to update push subscription. (${updateError.message})`)
			}

			return { ok: true }
		}

		const { error, data: insertedSubscriptions } = await supabase
			.from("push_subscriptions")
			.insert({ user_id: user.id, subscription })
			.select("id")

		if (error) {
			logPushServerError("[push] supabase insert failed", error, { endpoint: subscription.endpoint })
			return createSubscribeFailure("backend_failed", `Unable to store push subscription. (${error.message})`)
		}

		if (!insertedSubscriptions?.length) {
			const message = "Push subscription insert did not return a stored row."
			logPushServerError("[push] supabase insert returned no rows", new Error(message), { endpoint: subscription.endpoint })
			return createSubscribeFailure("backend_failed", message)
		}

		return { ok: true }
	} catch (error) {
		logPushServerError("[push] subscribeUser unexpected failure", error, {
			endpoint: isSubscriptionObject(subscription) ? subscription.endpoint : undefined,
		})
		return createSubscribeFailure(
			"backend_failed",
			error instanceof Error ? error.message : "Unexpected push subscription failure."
		)
	}
}

export async function unsubscribeUser(endpoint: string): Promise<{ ok: true }> {
	if (endpoint.trim().length === 0) throw new Error("Invalid push subscription endpoint.")

	const user = await requireUser()
	const supabase = createSupabaseAdminClient()

	const { error } = await supabase.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", endpoint)

	if (error) throw new Error(`Unable to remove push subscription. (${error.message})`)

	return { ok: true }
}

export async function sendTestNotification(message: string): Promise<SendTestNotificationResult> {
	ensureWebPushConfiguration()

	const user = await requireUser()
	const supabase = createSupabaseAdminClient()
	const payload = JSON.stringify({
		title: "Teste de notificacao",
		body: normalizeMonthlyMessage(message),
		icon: DEFAULT_ICON,
		url: "/settings",
	})

	const { data, error } = await supabase.from("push_subscriptions").select("id, subscription").eq("user_id", user.id)

	if (error) throw new Error(`Unable to read current user push subscriptions. (${error.message})`)
	if (!data?.length) throw new Error("No push subscription available for the current user.")

	let delivered = 0
	let removed = 0

	await Promise.all(
		data.map(async (row) => {
			try {
				await webpush.sendNotification(row.subscription as webpush.PushSubscription, payload)
				delivered += 1
			} catch (error) {
				if (!isSubscriptionGoneError(error)) {
					console.error("[push] Unable to send test notification", { subscriptionId: row.id, error })
					return
				}

				removed += 1
				const { error: deleteError } = await supabase.from("push_subscriptions").delete().eq("id", row.id)

				if (deleteError) {
					console.error("[push] Unable to clean stale subscription after test notification", {
						subscriptionId: row.id,
						error: deleteError,
					})
				}
			}
		})
	)

	return { delivered, removed }
}

export async function sendMonthlyNotification(message: string): Promise<SendMonthlyNotificationResult> {
	ensureWebPushConfiguration()

	const supabase = createSupabaseAdminClient()
	const payload = JSON.stringify({ title: DEFAULT_TITLE, body: normalizeMonthlyMessage(message), icon: DEFAULT_ICON, url: "/" })

	const { data, error } = await supabase.from("push_subscriptions").select("id, subscription")

	if (error) throw new Error(`Unable to read push subscriptions. (${error.message})`)
	if (!data?.length) return { delivered: 0, removed: 0 }

	let delivered = 0
	let removed = 0

	await Promise.all(
		data.map(async (row) => {
			try {
				await webpush.sendNotification(row.subscription as webpush.PushSubscription, payload)
				delivered += 1
			} catch (error) {
				if (!isSubscriptionGoneError(error)) {
					console.error("[push] Unable to send notification", { subscriptionId: row.id, error })
					return
				}

				removed += 1
				const { error: deleteError } = await supabase.from("push_subscriptions").delete().eq("id", row.id)

				if (deleteError) {
					console.error("[push] Unable to clean stale subscription", { subscriptionId: row.id, error: deleteError })
				}
			}
		})
	)

	return { delivered, removed }
}

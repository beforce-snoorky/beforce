import { sendMonthlyNotification } from "@/app/actions/push"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const DEFAULT_MESSAGE = "Seu relatório mensal está disponível"
const NOTIFICATION_SECRET_HEADER = "x-notification-secret"

type MonthlyNotificationBody = { message?: unknown }

function resolveMessage(body: MonthlyNotificationBody): string {
	if (typeof body.message !== "string") return DEFAULT_MESSAGE
	const normalized = body.message.trim()
	if (normalized.length === 0) return DEFAULT_MESSAGE
	return normalized
}

function isAuthorized(request: Request): boolean {
	const expectedSecret = process.env.NOTIFICATIONS_API_SECRET
	if (!expectedSecret) return true

	return request.headers.get(NOTIFICATION_SECRET_HEADER) === expectedSecret
}

export async function POST(request: Request) {
	if (!isAuthorized(request)) {
		return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
	}

	try {
		const body = (await request.json().catch(() => ({}))) as MonthlyNotificationBody
		const message = resolveMessage(body)
		const result = await sendMonthlyNotification(message)

		return NextResponse.json({ ok: true, ...result })
	} catch (error) {
		console.error("[notifications.monthly] Unable to process notification request", error)

		return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 })
	}
}

import type { AbstractIntlMessages } from "next-intl"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"

type RouteIntlProviderProps = { children: React.ReactNode; namespaces: readonly string[] }

type MessageValue = AbstractIntlMessages | string

function isMessageObject(value: MessageValue | undefined): value is AbstractIntlMessages {
	return typeof value === "object" && value !== null
}

function getMessageByPath(messages: AbstractIntlMessages, path: readonly string[]): MessageValue | undefined {
	let current: MessageValue = messages

	for (const segment of path) {
		if (!isMessageObject(current)) return undefined

		current = current[segment]
		if (current === undefined) return undefined
	}

	return current
}

function setMessageByPath(target: AbstractIntlMessages, path: readonly string[], value: MessageValue) {
	let current = target

	path.forEach((segment, index) => {
		const isLeaf = index === path.length - 1
		if (isLeaf) {
			current[segment] = value
			return
		}

		const existing = current[segment]
		if (!isMessageObject(existing)) {
			current[segment] = {}
		}

		current = current[segment] as AbstractIntlMessages
	})
}

function pickMessages(messages: AbstractIntlMessages, namespaces: readonly string[]): AbstractIntlMessages {
	const scopedMessages: AbstractIntlMessages = {}

	for (const namespace of namespaces) {
		const path = namespace.split(".")
		const messageValue = getMessageByPath(messages, path)
		if (messageValue === undefined) continue

		setMessageByPath(scopedMessages, path, messageValue)
	}

	return scopedMessages
}

export async function RouteIntlProvider({ children, namespaces }: RouteIntlProviderProps) {
	const messages = await getMessages()

	return <NextIntlClientProvider messages={pickMessages(messages, namespaces)}>{children}</NextIntlClientProvider>
}

self.addEventListener("install", (event) => {
	event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", (event) => {
	event.waitUntil(self.clients.claim())
})

self.addEventListener("push", (event) => {
	if (!event.data) return

	let data

	try {
		data = event.data.json()
	} catch {
		return
	}

	const title = typeof data.title === "string" && data.title.length > 0 ? data.title : "Notificacao"
	const body = typeof data.body === "string" ? data.body : ""
	const icon = typeof data.icon === "string" && data.icon.length > 0 ? data.icon : "/icons/icon-192.png"
	const url = typeof data.url === "string" && data.url.length > 0 ? data.url : "/"

	event.waitUntil(self.registration.showNotification(title, { body, icon, badge: "/icons/icon-192.png", data: { url } }))
})

self.addEventListener("notificationclick", (event) => {
	event.notification.close()

	const targetUrl = event.notification.data?.url || "/"

	event.waitUntil(
		clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
			for (const client of windowClients) {
				if (!("focus" in client)) continue

				if ("navigate" in client) client.navigate(targetUrl)
				return client.focus()
			}

			if (clients.openWindow) return clients.openWindow(targetUrl)
			return Promise.resolve(undefined)
		})
	)
})

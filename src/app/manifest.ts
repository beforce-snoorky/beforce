import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
	return {
		id: "/",
		name: "Beforce Dashboard",
		short_name: "Beforce",
		description: "Plataforma de relatórios e automação",
		lang: "pt-BR",
		start_url: "/pt",
		scope: "/",
		display: "standalone",
		orientation: "portrait",
		background_color: "#111113",
		theme_color: "#111113",
		icons: [
			{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
			{ src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
		],
	}
}

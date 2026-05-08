import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = []

if (supabaseUrl) {
	try {
		const { hostname, protocol } = new URL(supabaseUrl)

		remotePatterns.push({ protocol: protocol.replace(":", "") as "http" | "https", hostname, pathname: "/**" })
	} catch {}
}

const nextConfig: NextConfig = {
	reactStrictMode: true,
	images: { remotePatterns },
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "X-Frame-Options", value: "DENY" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
				],
			},
			{
				source: "/sw.js",
				headers: [
					{ key: "Content-Type", value: "application/javascript; charset=utf-8" },
					{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
					{ key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
				],
			},
		]
	},
}

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

export default withNextIntl(nextConfig)

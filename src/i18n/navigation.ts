import { routing } from "@/i18n/routing"
import { createNavigation } from "next-intl/navigation"
import { createElement, forwardRef, type ComponentProps } from "react"

const { Link: BaseLink, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)

type LinkProps = ComponentProps<typeof BaseLink>

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ prefetch = false, ...props }, ref) {
	return createElement(BaseLink, { ...props, prefetch, ref })
})

export { redirect, usePathname, useRouter, getPathname }

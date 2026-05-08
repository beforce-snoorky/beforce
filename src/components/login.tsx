"use client"

import { signInWithPassword } from "@/features/auth"
import type { SignInActionState } from "@/types/auth"
import { UserRound, KeyRound } from "lucide-react"
import { useTranslations } from "next-intl"
import { useActionState, useRef, useMemo, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

const initialState: SignInActionState = { status: "idle" }

export function LoginForm({ locale }: { locale: string }) {
	const translate = useTranslations("Auth")
	const [state, formAction, isPending] = useActionState(signInWithPassword, initialState)

	const errorRef = useRef<HTMLDivElement>(null)

	const errorMessage = useMemo(() => {
		if (state.status !== "error") return null

		switch (state.reason) {
			case "missing_fields":
				return translate("loginErrorMissing")
			case "invalid_credentials":
				return translate("loginErrorInvalid")
			case "rate_limited":
				return translate("loginErrorRateLimit")
			default:
				return translate("loginErrorGeneric")
		}
	}, [state, translate])

	useEffect(() => {
		if (errorMessage) errorRef.current?.focus()
	}, [errorMessage])

	const errorId = errorMessage ? "login-error" : undefined
	const hasError = Boolean(errorMessage)

	return (
		<form
			action={formAction}
			className="w-full max-w-sm space-y-4"
		>
			<div className="p-6 rounded-4xl space-y-4 bg-background">
				<input
					type="hidden"
					name="locale"
					value={locale}
				/>

				<Input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					placeholder={translate("emailPlaceholder")}
					icon={<UserRound className="size-4" />}
					error={hasError}
				/>

				<Input
					id="password"
					name="password"
					type="password"
					autoComplete="current-password"
					placeholder={translate("passwordPlaceholder")}
					icon={<KeyRound className="size-4" />}
					error={hasError}
				/>

				<Button
					type="submit"
					variant="primary"
					loading={isPending}
					disabled={isPending}
					aria-disabled={isPending}
					fullWidth
				>
					{isPending ? translate("loginLoading") : translate("loginSubmit")}
				</Button>
			</div>

			{errorMessage ? (
				<div
					id={errorId}
					ref={errorRef}
					tabIndex={-1}
					role="alert"
					aria-live="assertive"
					className="text-center text-primary-foreground"
				>
					{errorMessage}
				</div>
			) : null}
		</form>
	)
}

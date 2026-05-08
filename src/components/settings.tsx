"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { PwaStatus } from "@/components/pwa-status"
import { QueryErrorState } from "@/components/ui/queryErrorState"
import { useAuth } from "@/context/auth"
import { addMember, toggleMemberStatus, updateMemberRole } from "@/features/settings"
import { fetchSettingsPageData } from "@/lib/api"
import { companyRoleOptions, type CompanyMember, type SettingsPageData } from "@/types/settings"
import type { CompanyRole } from "@/types/supabase"
import { ChevronsUpDown, KeyRound, Mail, Search, ShieldUser, UserCog2Icon, UserPlus2, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo, useRef, useState } from "react"
import { SettingsSkeleton } from "./settings-skeleton"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select } from "./ui/select"
import { Table, TableHead, TableHeader } from "./ui/table"

const SETTINGS_STALE_TIME_MS = 5 * 60 * 1000

export function SettingsPage() {
	const { company } = useAuth()
	const queryClient = useQueryClient()
	const translate = useTranslations("Settings")
	const queryKey = ["settings", company.companyId] as const

	const settingsQuery = useQuery({
		queryKey,
		queryFn: ({ signal }) => fetchSettingsPageData({ companyId: company.companyId, signal }),
		refetchOnWindowFocus: false,
		staleTime: SETTINGS_STALE_TIME_MS,
	})

	const [memberSearchDraft, setMemberSearchDraft] = useState("")
	const [emailDraft, setEmailDraft] = useState("")
	const [passwordDraft, setPasswordDraft] = useState("")
	const [roleDraft, setRoleDraft] = useState<CompanyRole>("member")
	const [isAddModalOpen, setIsAddModalOpen] = useState(false)
	const [feedback, setFeedback] = useState<string | null>(null)
	const [addingMember, setAddingMember] = useState(false)
	const [editingRoleMemberId, setEditingRoleMemberId] = useState<string | null>(null)
	const [togglingMemberId, setTogglingMemberId] = useState<string | null>(null)
	const optimisticMemberIdRef = useRef(0)

	const roleOptions = useMemo(
		() => companyRoleOptions.map((role) => ({ value: role, label: translate(`fields.roles.${role}`) })),
		[translate]
	)

	const roleLabels = useMemo(
		() =>
			Object.fromEntries(roleOptions.map((roleOption) => [roleOption.value, roleOption.label])) as Record<CompanyRole, string>,
		[roleOptions]
	)

	if (settingsQuery.isPending && !settingsQuery.data) {
		return <SettingsSkeleton />
	}

	if (settingsQuery.error && !settingsQuery.data) {
		return (
			<QueryErrorState
				title={translate("states.failedToLoadTitle")}
				description={translate("states.failedToLoadDescription")}
				actionLabel={translate("states.retry")}
				onRetry={() => void settingsQuery.refetch()}
			/>
		)
	}

	if (!settingsQuery.data) {
		return <SettingsSkeleton />
	}

	const settingsData = settingsQuery.data
	const currentUserRole = settingsData.currentUserRole
	const filteredMembers = filterMembers(settingsData.members, memberSearchDraft)
	const isMutating = addingMember || Boolean(editingRoleMemberId) || Boolean(togglingMemberId)
	const canAddMember = currentUserRole === "admin"
	const canToggleMemberStatus = currentUserRole === "admin"

	function updateSettingsCache(updater: (currentData: SettingsPageData) => SettingsPageData) {
		queryClient.setQueryData<SettingsPageData>(queryKey, (currentData) => {
			if (!currentData) return currentData
			return updater(currentData)
		})
	}

	async function handleRoleChange(member: CompanyMember, nextRole: CompanyRole) {
		if (!canEditRole(currentUserRole, member.role)) return
		if (currentUserRole === "owner" && nextRole === "admin") return
		if (member.role === nextRole) return
		if (isMutating) return

		const previousRole = member.role

		setFeedback(null)
		setEditingRoleMemberId(member.id)
		updateSettingsCache((currentData) => ({
			...currentData,
			currentUserRole: member.userId === currentData.currentUserId ? nextRole : currentData.currentUserRole,
			members: sortMembers(
				currentData.members.map((currentMember) =>
					currentMember.id === member.id ? { ...currentMember, role: nextRole } : currentMember
				)
			),
		}))

		const result = await updateMemberRole({ memberId: member.id, role: nextRole })
		setEditingRoleMemberId(null)

		if (!result.ok) {
			updateSettingsCache((currentData) => ({
				...currentData,
				currentUserRole: member.userId === currentData.currentUserId ? previousRole : currentData.currentUserRole,
				members: sortMembers(
					currentData.members.map((currentMember) =>
						currentMember.id === member.id ? { ...currentMember, role: previousRole } : currentMember
					)
				),
			}))
			setFeedback(result.error)
			return
		}

		updateSettingsCache((currentData) => ({
			...currentData,
			currentUserRole: result.member.userId === currentData.currentUserId ? result.member.role : currentData.currentUserRole,
			members: sortMembers(
				currentData.members.map((currentMember) => (currentMember.id === result.member.id ? result.member : currentMember))
			),
		}))
	}

	async function handleToggleMemberStatus(member: CompanyMember) {
		if (!canToggleMemberStatus) return
		if (isMutating) return

		const nextIsActive = !member.isActive

		setFeedback(null)
		setTogglingMemberId(member.id)
		updateSettingsCache((currentData) => ({
			...currentData,
			members: sortMembers(
				currentData.members.map((currentMember) =>
					currentMember.id === member.id ? { ...currentMember, isActive: nextIsActive } : currentMember
				)
			),
		}))

		const result = await toggleMemberStatus({ memberId: member.id, isActive: nextIsActive })
		setTogglingMemberId(null)

		if (!result.ok) {
			updateSettingsCache((currentData) => ({
				...currentData,
				members: sortMembers(
					currentData.members.map((currentMember) =>
						currentMember.id === member.id ? { ...currentMember, isActive: member.isActive } : currentMember
					)
				),
			}))
			setFeedback(result.error)
			return
		}

		updateSettingsCache((currentData) => ({
			...currentData,
			members: sortMembers(
				currentData.members.map((currentMember) => (currentMember.id === result.member.id ? result.member : currentMember))
			),
		}))
	}

	async function handleAddMember(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (!canAddMember) return
		if (isMutating) return

		const normalizedEmail = emailDraft.trim().toLowerCase()
		if (!normalizedEmail) {
			setFeedback(translate("states.emailRequired"))
			return
		}

		if (!passwordDraft) {
			setFeedback(translate("states.passwordRequired"))
			return
		}

		optimisticMemberIdRef.current += 1
		const optimisticId = `optimistic-${optimisticMemberIdRef.current}`
		const optimisticMember: CompanyMember = {
			id: optimisticId,
			userId: optimisticId,
			email: normalizedEmail,
			role: roleDraft,
			isActive: true,
		}

		const previousPassword = passwordDraft

		setFeedback(null)
		setAddingMember(true)
		updateSettingsCache((currentData) => ({ ...currentData, members: sortMembers([optimisticMember, ...currentData.members]) }))
		setEmailDraft("")
		setPasswordDraft("")

		const result = await addMember({ email: normalizedEmail, password: previousPassword, role: roleDraft })
		setAddingMember(false)

		if (!result.ok) {
			updateSettingsCache((currentData) => ({
				...currentData,
				members: currentData.members.filter((currentMember) => currentMember.id !== optimisticId),
			}))
			setFeedback(result.error)
			setEmailDraft(normalizedEmail)
			setPasswordDraft(previousPassword)
			return
		}

		updateSettingsCache((currentData) => ({
			...currentData,
			members: sortMembers(
				currentData.members.map((currentMember) => (currentMember.id === optimisticId ? result.member : currentMember))
			),
		}))
		setRoleDraft("member")
		setIsAddModalOpen(false)
	}

	return (
		<section className="space-y-4">
			<header className="space-y-1">
				<h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight lg:text-2xl">
					<ShieldUser className="size-6 text-primary lg:size-8" /> {translate("title")}
				</h1>
				<p className="text-sm text-muted-foreground lg:text-base">{translate("subtitle")}</p>
			</header>

			<div className="flex flex-col gap-4 md:flex-row md:items-start">
				<div className="w-full md:max-w-md md:flex-none">
					<PwaStatus />
				</div>

				<section
					className="w-full flex-1 rounded-4xl bg-background p-4 space-y-4"
					aria-labelledby="settings-members-heading"
				>
					<div className="space-y-1">
						<h2
							id="settings-members-heading"
							className="text-lg font-semibold tracking-tight"
						>
							{translate("members.title")}
						</h2>
						<p className="text-sm text-foreground-muted">{translate("members.subtitle")}</p>
					</div>

					<div className="flex flex-col gap-2 rounded-4xl bg-background-muted p-4 md:flex-row md:items-center md:justify-between">
						<div className="w-full md:max-w-sm">
							<Input
								id="settings-search"
								name="search"
								value={memberSearchDraft}
								onChange={(event) => setMemberSearchDraft(event.target.value)}
								placeholder={translate("search.placeholder")}
								autoComplete="off"
								icon={<Search className="size-4" />}
								primary
							/>
						</div>

						{canAddMember ? (
							<Button
								type="button"
								variant="primary"
								disabled={isMutating}
								onClick={() => {
									setFeedback(null)
									setIsAddModalOpen(true)
								}}
							>
								<UserPlus2 className="size-5" />
								{translate("actions.addUser")}
							</Button>
						) : null}
					</div>

					{feedback ? (
						<p
							className="text-sm text-error"
							role="status"
							aria-live="polite"
						>
							{feedback}
						</p>
					) : null}

					{filteredMembers.length === 0 ? (
						<p className="rounded-3xl bg-background-muted p-4 text-sm text-foreground-muted">{translate("members.empty")}</p>
					) : (
						<>
							<div className="hidden md:block overflow-hidden rounded-4xl">
								<div className="max-h-104 overflow-auto">
									<Table>
										<TableHeader background="bg-background-muted">
											<tr>
												<TableHead>{translate("table.columns.user")}</TableHead>
												<TableHead>{translate("table.columns.role")}</TableHead>
												{canToggleMemberStatus ? <TableHead>{translate("table.columns.edit")}</TableHead> : null}
											</tr>
										</TableHeader>
										<tbody>
											{filteredMembers.map((member) => {
												const canUpdateRole = canEditRole(currentUserRole, member.role)

												return (
													<tr
														key={member.id}
														className="odd:bg-background even:bg-background-muted"
													>
														<td className="px-4 py-3">
															<div className="flex items-center gap-3 whitespace-nowrap">
																<div className="flex size-8 items-center justify-center rounded-2xl">
																	<UserCog2Icon className="size-4 text-primary" />
																</div>
																<span className="font-medium">{member.email}</span>
															</div>
														</td>

														<td className="w-48 px-4 py-3">
															{canUpdateRole ? (
																<div className="flex items-center">
																	<Select
																		name={`settings-role-${member.id}`}
																		value={member.role}
																		disabled={isMutating}
																		options={roleOptions}
																		onValueChange={(value) => {
																			if (!canEditRole(currentUserRole, member.role, value as CompanyRole)) return
																			void handleRoleChange(member, value as CompanyRole)
																		}}
																		primary
																	/>
																</div>
															) : (
																<span className="inline-flex rounded-4xl bg-background px-4 py-2 text-sm text-foreground">
																	{roleLabels[member.role]}
																</span>
															)}
														</td>

														{canToggleMemberStatus ? (
															<td className="w-28 px-4 py-3">
																<div className="w-28 px-4">
																	<button
																		type="button"
																		onClick={() => void handleToggleMemberStatus(member)}
																		className={`relative h-6 w-10 rounded-full ${
																			member.isActive ? "bg-emerald-400" : "bg-gray-300"
																		}`}
																	>
																		<div
																			className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
																				member.isActive ? "left-5" : "left-1"
																			}`}
																		/>
																	</button>
																</div>
															</td>
														) : null}
													</tr>
												)
											})}
										</tbody>
									</Table>
								</div>
							</div>

							<div className="space-y-3 md:hidden">
								{filteredMembers.map((member) => {
									const canUpdateRole = canEditRole(currentUserRole, member.role)

									return (
										<details
											key={member.id}
											className="rounded-3xl bg-background-muted"
										>
											<summary className="flex list-none items-center justify-between gap-3 p-4">
												<div className="min-w-0 flex items-center gap-3">
													<div className="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-background">
														<UserCog2Icon className="size-4 text-primary" />
													</div>
													<span className="truncate text-sm font-medium leading-tight">{member.email}</span>
												</div>
												<ChevronsUpDown className="size-4 shrink-0 text-foreground-muted" />
											</summary>

											<div className="space-y-3 px-4 pb-4">
												<div className="flex items-center justify-between gap-3">
													<span className="text-sm text-foreground-muted">{translate("mobile.role")}</span>
													{canUpdateRole ? (
														<div className="w-40">
															<Select
																name={`settings-mobile-role-${member.id}`}
																value={member.role}
																disabled={isMutating}
																options={roleOptions}
																onValueChange={(value) => void handleRoleChange(member, value as CompanyRole)}
																primary
															/>
														</div>
													) : (
														<span className="inline-flex rounded-4xl bg-background px-4 py-2 text-sm text-foreground">
															{roleLabels[member.role]}
														</span>
													)}
												</div>

												{canToggleMemberStatus ? (
													<div className="flex items-center justify-between gap-3">
														<span className="text-sm text-foreground-muted">{translate("mobile.active")}</span>
														<div className="w-28 place-items-end">
															<button
																type="button"
																onClick={() => void handleToggleMemberStatus(member)}
																className={`relative h-6 w-10 rounded-full ${member.isActive ? "bg-emerald-400" : "bg-gray-300"}`}
															>
																<div
																	className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
																		member.isActive ? "left-5" : "left-1"
																	}`}
																/>
															</button>
														</div>
													</div>
												) : null}
											</div>
										</details>
									)
								})}
							</div>
						</>
					)}
				</section>
			</div>

			{canAddMember && isAddModalOpen ? (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
					onClick={() => {
						if (!isMutating) setIsAddModalOpen(false)
					}}
				>
					<div
						className="w-full max-w-lg rounded-4xl bg-background-muted p-4 space-y-4"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold">{translate("modal.title")}</h2>

							<button
								type="button"
								disabled={isMutating}
								onClick={() => setIsAddModalOpen(false)}
							>
								<X className="size-5" />
							</button>
						</div>

						<form
							onSubmit={handleAddMember}
							className="space-y-4"
						>
							<Input
								id="settings-member-email"
								name="email"
								type="email"
								value={emailDraft}
								onChange={(event) => setEmailDraft(event.target.value)}
								placeholder={translate("fields.emailPlaceholder")}
								autoComplete="off"
								icon={<Mail className="size-4" />}
								disabled={isMutating}
								primary
							/>

							<Input
								id="settings-member-password"
								name="password"
								type="password"
								value={passwordDraft}
								onChange={(event) => setPasswordDraft(event.target.value)}
								placeholder={translate("fields.passwordPlaceholder")}
								autoComplete="new-password"
								icon={<KeyRound className="size-4" />}
								disabled={isMutating}
								primary
							/>

							<div className="flex items-center gap-4">
								<div className="w-48">
									<Select
										name="settings-new-member-role"
										value={roleDraft}
										disabled={isMutating}
										options={roleOptions}
										onValueChange={(value) => setRoleDraft(value as CompanyRole)}
										primary
									/>
								</div>

								<div className="flex flex-1 justify-end gap-4">
									<Button
										type="button"
										variant="secondary"
										disabled={isMutating}
										onClick={() => setIsAddModalOpen(false)}
									>
										{translate("actions.cancel")}
									</Button>

									<Button
										type="submit"
										variant="primary"
										disabled={isMutating}
										loading={addingMember}
									>
										{translate("actions.createUser")}
									</Button>
								</div>
							</div>
						</form>
					</div>
				</div>
			) : null}
		</section>
	)
}

function canEditRole(currentUserRole: CompanyRole, targetRole: CompanyRole, nextRole?: CompanyRole): boolean {
	if (currentUserRole === "admin") return true
	if (currentUserRole === "owner") {
		if (targetRole === "admin") return false
		if (nextRole === "admin") return false
		return true
	}

	return false
}

function filterMembers(members: CompanyMember[], searchDraft: string): CompanyMember[] {
	const normalizedSearch = searchDraft.trim().toLowerCase()
	if (!normalizedSearch) return members

	return members.filter((member) => member.email.toLowerCase().includes(normalizedSearch))
}

function sortMembers(members: CompanyMember[]): CompanyMember[] {
	return [...members].sort((left, right) => {
		if (left.isActive !== right.isActive) return left.isActive ? -1 : 1
		return left.email.localeCompare(right.email)
	})
}

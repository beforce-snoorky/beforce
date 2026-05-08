"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { QueryErrorState } from "@/components/ui/queryErrorState"
import { useAuth } from "@/context/auth"
import { createFeatureRequest, updateFeature, updateFeatureStatus } from "@/features/resource"
import { fetchResourcePageData } from "@/lib/api"
import { featureStatuses, type FeatureCard, type FeatureStatus, type ResourcePageData } from "@/types/resource"
import { validateSuggestionInput } from "@/utils/resource"
import { Eye, EyeClosed, GitGraph, GripVertical, Pencil, Send, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { ResourceSkeleton } from "./resource-skeleton"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

const RESOURCE_STALE_TIME_MS = 5 * 60 * 1000

const columnStyles: Record<FeatureStatus, string> = {
	backlog: "bg-red-500/50",
	planned: "bg-sky-500/50",
	in_progress: "bg-yellow-500/50",
	done: "bg-emerald-500/50",
}

const columnDropStyles: Record<FeatureStatus, string> = {
	backlog: "ring-2 ring-red-300/50",
	planned: "ring-2 ring-sky-300/50",
	in_progress: "ring-2 ring-yellow-300/50",
	done: "ring-2 ring-emerald-300/50",
}

export function ResourcePage() {
	const { company } = useAuth()
	const queryClient = useQueryClient()
	const locale = useLocale()
	const translate = useTranslations("Resource")
	const queryKey = ["resource", company.companyId, locale] as const

	const resourceQuery = useQuery({
		queryKey,
		queryFn: ({ signal }) => fetchResourcePageData({ companyId: company.companyId, locale, signal }),
		refetchOnWindowFocus: false,
		staleTime: RESOURCE_STALE_TIME_MS,
	})

	const [feedback, setFeedback] = useState<string | null>(null)
	const [requestError, setRequestError] = useState<string | null>(null)
	const [requestModalOpen, setRequestModalOpen] = useState(false)
	const [requestTitle, setRequestTitle] = useState("")
	const [requestDescription, setRequestDescription] = useState("")
	const [submittingRequest, setSubmittingRequest] = useState(false)
	const [draggingFeatureId, setDraggingFeatureId] = useState<string | null>(null)
	const [movingFeatureId, setMovingFeatureId] = useState<string | null>(null)
	const [activeDropStatus, setActiveDropStatus] = useState<FeatureStatus | null>(null)
	const [editModalOpen, setEditModalOpen] = useState(false)
	const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null)
	const [editTitle, setEditTitle] = useState("")
	const [editDescription, setEditDescription] = useState("")
	const [editIsVisible, setEditIsVisible] = useState(true)
	const [savingEdit, setSavingEdit] = useState(false)
	const [editError, setEditError] = useState<string | null>(null)

	const isMutating = submittingRequest || Boolean(movingFeatureId) || savingEdit

	const statusLabels: Record<FeatureStatus, string> = {
		backlog: translate("status.backlog"),
		planned: translate("status.planned"),
		in_progress: translate("status.inProgress"),
		done: translate("status.done"),
	}

	const featuresByStatus = useMemo(() => {
		const features = resourceQuery.data?.features ?? []

		return Object.fromEntries(
			featureStatuses.map((status) => [status, features.filter((feature) => feature.status === status)])
		) as Record<FeatureStatus, FeatureCard[]>
	}, [resourceQuery.data?.features])

	if (resourceQuery.isPending && !resourceQuery.data) {
		return <ResourceSkeleton />
	}

	if (resourceQuery.error && !resourceQuery.data) {
		return (
			<QueryErrorState
				title={translate("states.failedToLoadTitle")}
				description={translate("states.failedToLoadDescription")}
				actionLabel={translate("states.retry")}
				onRetry={() => void resourceQuery.refetch()}
			/>
		)
	}

	if (!resourceQuery.data) {
		return <ResourceSkeleton />
	}

	const resourceData = resourceQuery.data

	function getValidationMessage(validationError: "title_min" | "description_min"): string {
		if (validationError === "title_min") return translate("validation.title_min")
		return translate("validation.description_min")
	}

	function updateResourceCache(updater: (currentData: ResourcePageData) => ResourcePageData) {
		queryClient.setQueryData<ResourcePageData>(queryKey, (currentData) => {
			if (!currentData) return currentData
			return updater(currentData)
		})
	}

	async function handleCreateRequest(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (isMutating) return

		const validationError = validateSuggestionInput({ title: requestTitle, description: requestDescription })
		if (validationError) {
			setRequestError(getValidationMessage(validationError))
			return
		}

		setFeedback(null)
		setRequestError(null)
		setSubmittingRequest(true)

		let result: Awaited<ReturnType<typeof createFeatureRequest>>
		try {
			result = await createFeatureRequest({ title: requestTitle, description: requestDescription })
		} catch (error) {
			setSubmittingRequest(false)
			setRequestError(translate("feedback.createUnexpectedError"))
			console.error("[resource] createFeatureRequest failed", { error })
			return
		}

		setSubmittingRequest(false)

		if (!result.ok) {
			setRequestError(result.error)
			return
		}

		setRequestTitle("")
		setRequestDescription("")
		setRequestError(null)
		setRequestModalOpen(false)
		setFeedback(translate("feedback.createSuccess"))
		void queryClient.invalidateQueries({ queryKey })
	}

	function openEditModal(feature: FeatureCard) {
		setFeedback(null)
		setEditError(null)
		setEditingFeatureId(feature.id)
		setEditTitle(feature.title)
		setEditDescription(feature.description)
		setEditIsVisible(feature.isVisible)
		setEditModalOpen(true)
	}

	async function handleSaveFeature(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (!resourceData.isAdmin) return
		if (!editingFeatureId || isMutating) return

		const previousFeature = resourceData.features.find((feature) => feature.id === editingFeatureId)
		if (!previousFeature) return

		const nextTitle = editTitle.trim()
		const nextDescription = editDescription.trim()
		const validationError = validateSuggestionInput({ title: nextTitle, description: nextDescription })
		if (validationError) {
			setEditError(getValidationMessage(validationError))
			return
		}

		setFeedback(null)
		setEditError(null)
		setSavingEdit(true)

		updateResourceCache((currentData) => ({
			...currentData,
			features: currentData.features.map((feature) =>
				feature.id === editingFeatureId
					? { ...feature, title: nextTitle, description: nextDescription, isVisible: editIsVisible }
					: feature
			),
		}))

		let result: Awaited<ReturnType<typeof updateFeature>>
		try {
			result = await updateFeature({
				featureId: editingFeatureId,
				data: { title: nextTitle, description: nextDescription, isVisible: editIsVisible },
			})
		} catch (error) {
			setSavingEdit(false)
			updateResourceCache((currentData) => ({
				...currentData,
				features: currentData.features.map((feature) => (feature.id === previousFeature.id ? previousFeature : feature)),
			}))
			setEditError(translate("feedback.updateUnexpectedError"))
			console.error("[resource] updateFeature failed", { error, featureId: editingFeatureId })
			return
		}

		setSavingEdit(false)

		if (!result.ok) {
			updateResourceCache((currentData) => ({
				...currentData,
				features: currentData.features.map((feature) => (feature.id === previousFeature.id ? previousFeature : feature)),
			}))
			setEditError(result.error)
			return
		}

		updateResourceCache((currentData) => ({
			...currentData,
			features: currentData.features.map((feature) => (feature.id === result.feature.id ? result.feature : feature)),
		}))
		setEditModalOpen(false)
	}

	async function handleDropColumn(nextStatus: FeatureStatus) {
		if (!resourceData.isAdmin) return
		if (!draggingFeatureId || isMutating) return

		const movedFeatureId = draggingFeatureId
		const movingFeature = resourceData.features.find((feature) => feature.id === movedFeatureId)
		if (!movingFeature) return
		if (movingFeature.status === nextStatus) return

		const previousStatus = movingFeature.status

		setFeedback(null)
		setMovingFeatureId(movedFeatureId)
		updateResourceCache((currentData) => ({
			...currentData,
			features: currentData.features.map((feature) =>
				feature.id === movedFeatureId ? { ...feature, status: nextStatus } : feature
			),
		}))

		let result: Awaited<ReturnType<typeof updateFeatureStatus>>
		try {
			result = await updateFeatureStatus({ featureId: movedFeatureId, status: nextStatus })
		} catch (error) {
			setMovingFeatureId(null)
			setDraggingFeatureId(null)
			setActiveDropStatus(null)
			updateResourceCache((currentData) => ({
				...currentData,
				features: currentData.features.map((feature) =>
					feature.id === movedFeatureId ? { ...feature, status: previousStatus } : feature
				),
			}))
			setFeedback(translate("feedback.moveUnexpectedError"))
			console.error("[resource] updateFeatureStatus failed", { error, featureId: movedFeatureId, nextStatus })
			return
		}

		setMovingFeatureId(null)
		setDraggingFeatureId(null)
		setActiveDropStatus(null)

		if (!result.ok) {
			updateResourceCache((currentData) => ({
				...currentData,
				features: currentData.features.map((feature) =>
					feature.id === movedFeatureId ? { ...feature, status: previousStatus } : feature
				),
			}))
			setFeedback(result.error)
			return
		}

		updateResourceCache((currentData) => ({
			...currentData,
			features: currentData.features.map((feature) => (feature.id === result.feature.id ? result.feature : feature)),
		}))
	}

	return (
		<section>
			<div className="mb-7 space-y-4 lg:flex lg:items-center lg:justify-between lg:space-y-0">
				<header className="space-y-1">
					<h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight lg:text-2xl">
						<GitGraph className="size-6 text-primary lg:size-8" /> {translate("title")}
					</h1>
					<p className="text-sm text-foreground-muted lg:text-base">{translate("subtitle")}</p>
				</header>

				<Button
					type="button"
					variant="primary"
					disabled={isMutating}
					onClick={() => {
						setFeedback(null)
						setRequestError(null)
						setRequestModalOpen(true)
					}}
				>
					<Send className="size-4" />
					{translate("actions.newSuggestion")}
				</Button>
			</div>

			{feedback ? (
				<p className="mb-4 rounded-xl border border-border bg-background px-3 py-2 text-sm text-error">{feedback}</p>
			) : null}

			<div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
				{featureStatuses.map((status) => {
					const columnItems = featuresByStatus[status]
					const isDropActive = activeDropStatus === status && Boolean(draggingFeatureId)

					return (
						<section
							key={status}
							className={`rounded-4xl bg-background p-4 transition-all duration-150 ${columnStyles[status]} ${
								isDropActive ? columnDropStyles[status] : ""
							}`}
							onDragOver={(event) => {
								if (!resourceData.isAdmin) return
								event.preventDefault()
							}}
							onDragEnter={(event) => {
								if (!resourceData.isAdmin || !draggingFeatureId) return
								event.preventDefault()
								setActiveDropStatus(status)
							}}
							onDragLeave={(event) => {
								if (!resourceData.isAdmin) return

								const relatedTarget = event.relatedTarget as Node | null
								if (relatedTarget && event.currentTarget.contains(relatedTarget)) return

								setActiveDropStatus((currentStatus) => (currentStatus === status ? null : currentStatus))
							}}
							onDrop={(event) => {
								event.preventDefault()
								setActiveDropStatus(null)
								void handleDropColumn(status)
							}}
						>
							<div className="mb-4 flex items-center justify-between">
								<h2 className="font-medium tracking-tight">{statusLabels[status]}</h2>
								<span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${columnStyles[status]}`}>{columnItems.length}</span>
							</div>

							<hr className="mb-4 h-1 w-full opacity-25" />

							<div className="space-y-4">
								{columnItems.map((feature) => {
									const isDragging = draggingFeatureId === feature.id
									const isMoving = movingFeatureId === feature.id

									return (
										<article
											key={feature.id}
											draggable={resourceData.isAdmin}
											onDragStart={() => setDraggingFeatureId(feature.id)}
											onDragEnd={() => {
												setDraggingFeatureId(null)
												setActiveDropStatus(null)
											}}
											className={`rounded-3xl bg-background-muted p-4 transition-all duration-200 ${
												resourceData.isAdmin ? "cursor-grab active:cursor-grabbing" : ""
											} ${isDragging ? "scale-95 opacity-55" : ""} ${isMoving ? "opacity-60" : ""}`}
										>
											<div className="space-y-2">
												<div className="flex items-center justify-between gap-2">
													<h3 className="font-semibold leading-snug tracking-tight">{feature.title}</h3>
													{resourceData.isAdmin ? <GripVertical className="size-4 shrink-0 text-foreground-muted" /> : null}
												</div>
												<p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground-muted">{feature.description}</p>
											</div>

											<div className="my-4 flex flex-col space-y-2">
												{resourceData.isAdmin && feature.sourceRequestId && feature.source ? (
													<>
														<span className="text-sm text-foreground-muted">{feature.source.userEmail}</span>
														<span className="text-sm text-foreground-muted">{feature.source.companyName}</span>
													</>
												) : null}
											</div>

											{resourceData.isAdmin ? (
												<div className="flex items-center justify-between gap-2">
													{feature.isVisible ? <Eye className="size-4" /> : <EyeClosed className="size-4" />}
													<button
														type="button"
														disabled={isMutating}
														onClick={() => openEditModal(feature)}
														className="bg-primary px-2 py-1 text-sm hover:bg-primary-hover"
													>
														<Pencil className="size-4" />
														{translate("actions.edit")}
													</button>
												</div>
											) : null}
										</article>
									)
								})}
							</div>
						</section>
					)
				})}
			</div>

			{requestModalOpen ? (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
					onClick={() => {
						if (!isMutating) setRequestModalOpen(false)
					}}
				>
					<div
						className="w-full max-w-lg space-y-4 rounded-4xl bg-background-muted p-4"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold">{translate("modal.create.title")}</h2>

							<button
								type="button"
								disabled={isMutating}
								onClick={() => setRequestModalOpen(false)}
							>
								<X className="size-5" />
							</button>
						</div>

						<form
							onSubmit={handleCreateRequest}
							className="space-y-4"
						>
							{requestError ? <p className="text-sm text-error">{requestError}</p> : null}

							<Input
								id="resource-request-title"
								name="title"
								value={requestTitle}
								onChange={(event) => setRequestTitle(event.target.value)}
								placeholder={translate("modal.create.titlePlaceholder")}
								disabled={isMutating}
								primary
							/>

							<textarea
								id="resource-request-description"
								name="description"
								value={requestDescription}
								onChange={(event) => setRequestDescription(event.target.value)}
								placeholder={translate("modal.create.descriptionPlaceholder")}
								disabled={isMutating}
								className="min-h-36 w-full bg-background p-4"
							/>

							<div className="flex flex-1 justify-end gap-4">
								<Button
									type="button"
									variant="secondary"
									disabled={isMutating}
									onClick={() => setRequestModalOpen(false)}
								>
									{translate("actions.cancel")}
								</Button>

								<Button
									type="submit"
									variant="primary"
									disabled={isMutating}
									loading={submittingRequest}
								>
									{translate("actions.sendSuggestion")}
								</Button>
							</div>
						</form>
					</div>
				</div>
			) : null}

			{resourceData.isAdmin && editModalOpen ? (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
					onClick={() => {
						if (!isMutating) setEditModalOpen(false)
					}}
				>
					<div
						className="w-full max-w-lg space-y-4 rounded-4xl bg-background-muted p-4"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold">{translate("modal.edit.title")}</h2>

							<button
								type="button"
								disabled={isMutating}
								onClick={() => setEditModalOpen(false)}
							>
								<X className="size-5" />
							</button>
						</div>

						<form
							onSubmit={handleSaveFeature}
							className="space-y-4"
						>
							{editError ? <p className="text-sm text-error">{editError}</p> : null}

							<Input
								id="resource-feature-title"
								name="title"
								value={editTitle}
								onChange={(event) => setEditTitle(event.target.value)}
								placeholder={translate("modal.edit.titlePlaceholder")}
								disabled={isMutating}
								primary
							/>

							<textarea
								id="resource-feature-description"
								name="description"
								value={editDescription}
								onChange={(event) => setEditDescription(event.target.value)}
								placeholder={translate("modal.edit.descriptionPlaceholder")}
								disabled={isMutating}
								className="min-h-36 w-full bg-background p-4"
							/>

							<div className="flex flex-1 justify-between gap-4">
								<label className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={editIsVisible}
										onChange={(event) => setEditIsVisible(event.target.checked)}
										disabled={isMutating}
										className="size-4 accent-primary"
									/>
									{translate("modal.edit.visibleLabel")}
								</label>

								<div className="flex items-center gap-4">
									<Button
										type="button"
										variant="secondary"
										disabled={isMutating}
										onClick={() => setEditModalOpen(false)}
									>
										{translate("actions.cancel")}
									</Button>
									<Button
										type="submit"
										variant="primary"
										disabled={isMutating || !editingFeatureId}
										loading={savingEdit}
									>
										{translate("actions.save")}
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

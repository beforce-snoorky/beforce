import type { TableDesktopProps } from "@/types/digisac"
import {
	Bot,
	ChevronsUpDown,
	Clock,
	FileText,
	Hourglass,
	MessageCircleCheck,
	MessageCircleMore,
	MessageSquare,
	Timer,
	UsersRound,
} from "lucide-react"
import type { ReactNode } from "react"
import { Table, TableCell, TableHead, TableHeader } from "../ui/table"

const METRICS = [
	{ style: "text-sky-600 bg-sky-500/10", icon: <Hourglass className="size-4" />, key: "ticketTime" },
	{ style: "text-orange-600 bg-orange-500/10", icon: <Timer className="size-4" />, key: "waitingTime" },
	{ style: "text-amber-600 bg-amber-500/10", icon: <Bot className="size-4" />, key: "waitingTimeAfterBot" },
	{ style: "text-violet-600 bg-violet-500/10", icon: <Clock className="size-4" />, key: "waitingTimeAvg" },
	{ style: "text-emerald-600 bg-emerald-500/10", icon: <MessageSquare className="size-4" />, key: "sentMessages" },
	{ style: "text-cyan-600 bg-cyan-500/10", icon: <MessageCircleMore className="size-4" />, key: "receivedMessages" },
	{ style: "text-rose-600 bg-rose-500/10", icon: <FileText className="size-4" />, key: "totalMessages" },
]

export function TableDesktop({ rows, numberFormatter, translate }: TableDesktopProps) {
	return (
		<>
			<div className="hidden md:block overflow-hidden rounded-4xl bg-background">
				<div className="max-h-104 overflow-auto">
					<Table>
						<TableHeader>
							<tr>
								<TableHead>{translate("table.columns.operator")}</TableHead>
								<TableHead>{translate("table.columns.department")}</TableHead>
								<TableHead>{translate("table.columns.ticketTime")}</TableHead>
								<TableHead>{translate("table.columns.waitingTime")}</TableHead>
								<TableHead>{translate("table.columns.waitingTimeAfterBot")}</TableHead>
								<TableHead>{translate("table.columns.waitingTimeAvg")}</TableHead>
								<TableHead>{translate("table.columns.sentMessages")}</TableHead>
								<TableHead>{translate("table.columns.receivedMessages")}</TableHead>
								<TableHead>{translate("table.columns.totalMessages")}</TableHead>
								<TableHead>{translate("table.columns.openedTickets")}</TableHead>
								<TableHead>{translate("table.columns.closedTickets")}</TableHead>
								<TableHead>{translate("table.columns.totalTickets")}</TableHead>
								<TableHead>{translate("table.columns.contacts")}</TableHead>
							</tr>
						</TableHeader>
						<tbody>
							{rows.map((row) => (
								<tr
									key={row.id}
									className="border-t border-border odd:bg-background-muted/60 hover:bg-background-muted"
								>
									<td>
										<div className="w-full flex items-center gap-2 px-4 py-3 whitespace-nowrap">
											<div className="size-7 rounded-xl flex items-center justify-center text-primary bg-primary/10">
												<UsersRound className="size-4" />
											</div>
											{row.operatorName}
										</div>
									</td>
									<TableCell width="w-40">{row.department}</TableCell>
									<TableCell width="w-27">{row.ticketTime}</TableCell>
									<TableCell width="w-27">{row.waitingTime}</TableCell>
									<TableCell width="w-27">{row.waitingTimeAfterBot}</TableCell>
									<TableCell width="w-27">{row.waitingTimeAvg}</TableCell>
									<TableCell width="w-27">{numberFormatter.format(row.sentMessagesCount)}</TableCell>
									<TableCell width="w-27">{numberFormatter.format(row.receivedMessagesCount)}</TableCell>
									<TableCell width="w-27">{numberFormatter.format(row.totalMessagesCount)}</TableCell>
									<TableCell width="w-27">{numberFormatter.format(row.openedTicketsCount)}</TableCell>
									<TableCell width="w-27">{numberFormatter.format(row.closedTicketsCount)}</TableCell>
									<TableCell width="w-27">{numberFormatter.format(row.totalTicketsCount)}</TableCell>
									<TableCell width="w-27">{numberFormatter.format(row.contactsCount)}</TableCell>
								</tr>
							))}
						</tbody>
					</Table>
				</div>
			</div>

			<div className="md:hidden space-y-2 p-4 rounded-4xl bg-background">
				<div className="flex items-center gap-2 mb-4">
					<MessageCircleCheck className="size-5 text-primary" />
					<h2 className="text-md font-medium">{translate("table.title")}</h2>
				</div>

				<div className="max-h-74 space-y-2 overflow-y-auto">
					{rows.map((row) => (
						<details
							key={row.id}
							className="rounded-3xl bg-background-muted"
						>
							<summary className="list-none flex items-center justify-between p-4">
								<div className="flex items-center gap-2">
									<div className="size-8 rounded-xl flex items-center justify-center text-primary bg-primary/10">
										<UsersRound className="size-5" />
									</div>
									<div>
										<p className="font-medium leading-tight">{row.operatorName}</p>
										<p className="text-xs leading-tight text-foreground-muted">{row.department}</p>
									</div>
								</div>

								<ChevronsUpDown className="size-4" />
							</summary>

							<div className="space-y-2 p-4">
								<MetricItem
									label={translate("table.columns.ticketTime")}
									icon={METRICS.find((m) => m.key === "ticketTime")?.icon}
									style={METRICS.find((m) => m.key === "ticketTime")?.style || ""}
									value={row.ticketTime}
								/>

								<MetricItem
									label={translate("table.columns.waitingTime")}
									icon={METRICS.find((m) => m.key === "waitingTime")?.icon}
									style={METRICS.find((m) => m.key === "waitingTime")?.style || ""}
									value={row.waitingTime}
								/>

								<MetricItem
									label={translate("table.columns.waitingTimeAfterBot")}
									icon={METRICS.find((m) => m.key === "waitingTimeAfterBot")?.icon}
									style={METRICS.find((m) => m.key === "waitingTimeAfterBot")?.style || ""}
									value={row.waitingTimeAfterBot}
								/>

								<MetricItem
									label={translate("table.columns.waitingTimeAvg")}
									icon={METRICS.find((m) => m.key === "waitingTimeAvg")?.icon}
									style={METRICS.find((m) => m.key === "waitingTimeAvg")?.style || ""}
									value={row.waitingTimeAvg}
								/>

								<MetricItem
									label={translate("table.columns.sentMessages")}
									icon={METRICS.find((m) => m.key === "sentMessages")?.icon}
									style={METRICS.find((m) => m.key === "sentMessages")?.style || ""}
									value={numberFormatter.format(row.sentMessagesCount)}
								/>

								<MetricItem
									label={translate("table.columns.receivedMessages")}
									icon={METRICS.find((m) => m.key === "receivedMessages")?.icon}
									style={METRICS.find((m) => m.key === "receivedMessages")?.style || ""}
									value={numberFormatter.format(row.receivedMessagesCount)}
								/>

								<MetricItem
									label={translate("table.columns.totalMessages")}
									icon={METRICS.find((m) => m.key === "totalMessages")?.icon}
									style={METRICS.find((m) => m.key === "totalMessages")?.style || ""}
									value={numberFormatter.format(row.totalMessagesCount)}
								/>
							</div>
						</details>
					))}
				</div>
			</div>
		</>
	)
}

function MetricItem({ label, value, style, icon }: { label: string; value: string; style: string; icon: ReactNode }) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-2">
				<div className={`size-7 rounded-xl flex items-center justify-center ${style}`}>{icon}</div>
				<span className="text-xs text-foreground-muted">{label}</span>
			</div>
			<span className="font-medium">{value}</span>
		</div>
	)
}

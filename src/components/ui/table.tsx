export function Table({ style, children }: { style?: string, children: React.ReactNode }) {
  return <table className={`divide-y divide-surface ${style}`}>{children}</table>
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="sticky top-0 z-10 bg-gray-50">{children}</thead>
}

export function TableRow({ style, children }: { style?: string, children: React.ReactNode }) {
  return <tr className={style}>{children}</tr>
}

export function TableHeaderCell({ style, children }: { style?: string, children: React.ReactNode }) {
  return <th className={`py-3 px-4 text-start text-xs font-medium uppercase text-gray-500 ${style}`}>{children}</th>
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-200">{children}</tbody>
}

export function TableDataCell({ style, children }: { style?: string, children: React.ReactNode }) {
  return <td className={`py-3 px-4 whitespace-nowrap text-sm text-gray-800 ${style}`}>{children}</td>
}
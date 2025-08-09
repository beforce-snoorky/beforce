"use client"

import { useWebsiteReports } from "@/hooks/useWebsite"
import { useWebsiteFilter } from "@/hooks/useWebsiteFilterContext"
import { SlidersHorizontal, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Select } from "../ui/select"
import { formatPeriodToMonthYear } from "@/utils/data"
import { Button } from "../ui/button"

export function FilterModalWebsite({ onClose }: { onClose: () => void }) {
  const reportFilter = useWebsiteFilter()
  const { availablePeriods } = useWebsiteReports()

  const [localPeriod, setLocalPeriod] = useState(reportFilter.selectedPeriod)

  useEffect(() => {
    setLocalPeriod(reportFilter.selectedPeriod)
  }, [reportFilter.selectedPeriod])

  const handleApplyFilters = () => {
    reportFilter.setSelectedPeriod(localPeriod)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 bottom-6 z-50 flex items-end md:items-center justify-center pointer-events-none">
        <div className="w-full sm:max-w-lg mx-4 sm:mx-auto rounded-xl shadow-xl pointer-events-auto transition-all duration-300 ease-out animate-slide-up border border-surface bg-light">
          <div className="flex justify-between items-center py-3 px-4 border-b border-surface">
            <h3 className="font-bold text-lg">Filtrar Métricas do Site</h3>
            <button
              type="button"
              onClick={onClose}
              className="size-8 inline-flex justify-center items-center rounded-full bg-surface"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <Select
              id="periods"
              label="Períodos"
              options={availablePeriods.map(period => ({
                label: formatPeriodToMonthYear(period),
                value: period,
              }))}
              value={localPeriod}
              onChange={setLocalPeriod}
            />
          </div>
          <div className="flex justify-end items-center gap-2 py-3 px-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="button" variant="primary" onClick={handleApplyFilters}>
              <SlidersHorizontal className="size-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
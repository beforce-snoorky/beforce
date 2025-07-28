"use client"

import { X } from "lucide-react"
import { Modal } from "../ui/modal"
import { Select } from "../ui/select"
import { useReportFilter } from "@/context/reportFilter"
import { useDigisacData } from "@/hooks/useDigisacData"
import { useEffect, useState } from "react"
import { formatPeriod } from "@/utils/period"

export function FilterModal({ onClose }: { onClose: () => void }) {
  const reportFilter = useReportFilter()
  const { availablePeriods, operatorOptions } = useDigisacData()

  const [localPeriod, setLocalPeriod] = useState(reportFilter.selectedPeriod)
  const [localOperator, setLocalOperator] = useState(reportFilter.selectedOperatorDepartment)

  useEffect(() => {
    setLocalPeriod(reportFilter.selectedPeriod)
    setLocalOperator(reportFilter.selectedOperatorDepartment)
  }, [reportFilter.selectedPeriod, reportFilter.selectedOperatorDepartment])

  const handleApplyFilters = () => {
    reportFilter.setSelectedPeriod(localPeriod)
    reportFilter.setSelectedOperatorDepartment(localOperator)
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-4 animate-slide-up bg-light">
        <div className="relative mb-4">
          <h2 className="text-xl font-semibold">Filtrar Atendimento</h2>
          <p className="text-sm">Selecione os filtros desejados.</p>
          <button onClick={onClose} className="absolute right-0 top-0 w-8 h-8 flex items-center justify-center" aria-label="Fechar">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="grid gap-4 py-2">
          <Select
            id="operators"
            label="Funcionários"
            options={operatorOptions}
            value={localOperator}
            onChange={setLocalOperator}
          />
          <Select
            id="periods"
            label="Períodos"
            options={availablePeriods.map(period => ({ label: formatPeriod(period), value: period }))}
            value={localPeriod}
            onChange={setLocalPeriod}
          />
          <div className="pt-4 mt-2 border-t border-surface">
            <button
              onClick={handleApplyFilters}
              className="w-full font-medium flex justify-center items-center p-3 rounded-lg disabled:cursor-not-allowed transition-colors duration-200 bg-accent text-light"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </Modal >
  )
}
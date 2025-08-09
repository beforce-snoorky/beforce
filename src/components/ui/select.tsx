"use client"

import { ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"

type SelectProps = {
  id: string
  label: string
  options: { label: string, value: string }[]
  value: string
  onChange: (value: string) => void
}

export function Select(props: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedOption = props.options.find((opt) => opt.value === props.value)
  const displayLabel = selectedOption ? selectedOption.label : "Selecione..."

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false)
    }

    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    else document.removeEventListener("mousedown", handleClickOutside)

    return () => { document.removeEventListener("mousedown", handleClickOutside) }
  }, [isOpen])

  return (
    <div className="relative w-full inline-flex flex-col" ref={ref}>
      <button
        id={props.id}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="py-3 px-4 inline-flex items-center justify-between gap-x-2 text-sm rounded-lg border border-surface bg-light text-gray-800"
      >
        <span className="">{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-0 lg:bottom-auto lg:top-full z-50 mt-2 min-w-full shadow-md rounded-lg overflow-hidden border border-surface bg-light">
          <div className="p-1 space-y-0.5 max-h-40 overflow-y-auto">
            {props.options.map((option) => (
              <button key={option.value}
                className="w-full text-left flex items-center gap-x-2 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                onClick={() => {
                  props.onChange(option.value)
                  setIsOpen(false)
                }}
              >
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
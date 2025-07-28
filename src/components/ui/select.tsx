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
    <div className="relative" ref={ref}>
      <label htmlFor={props.id} className="block text-sm font-medium mb-1">{props.label}</label>
      <button
        id={props.id}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-sm w-full max-h-11 flex items-center justify-between p-3 rounded-lg border border-surface bg-dark/4"
      >
        <span className="">{displayLabel}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 max-h-36 bottom-0 xl:bottom-auto xl:top-full left-0 right-0 xl:mt-1 rounded-lg shadow-lg text-sm overflow-auto border border-surface bg-light">
          {props.options.map((option) => (
            <button key={option.value}
              className="block w-full text-left px-4 py-2 border-b last:border-b-0 border-surface"
              onClick={() => {
                props.onChange(option.value)
                setIsOpen(false)
              }}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
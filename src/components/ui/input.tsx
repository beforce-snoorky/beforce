interface InputProps {
  id: string
  icon: React.ReactNode
  name: string
  type: string
  placeholder?: string
  autoComplete?: string
  className?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  required?: boolean
}

export function Input(props: InputProps) {
  return (
    <div className="relative">
      <div className="absolute ps-4 inset-y-0 start-0 flex items-center">
        {props.icon}
      </div>
      <input
        id={props.id}
        name={props.name}
        type={props.type}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
        value={props.value}
        className={`text-sm w-full p-3 ps-12 outline-none rounded-lg border ${props.className ? `${props.className}` : "border-surface/25 bg-gray-800 text-gray-400"}`}
        onChange={props.onChange}
        aria-required={props.required}
        disabled={false || props.disabled}
        required={props.required}
      />
    </div>
  )
}
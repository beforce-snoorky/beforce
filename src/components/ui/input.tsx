interface InputProps {
  id: string
  name: string
  type: string
  placeholder?: string
  autoComplete?: string
  className?: string
  required?: boolean
}

export function Input({ id, name, type, placeholder, autoComplete, className, required = false }: InputProps) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      autoComplete={autoComplete}
      aria-required={required}
      required={required}
      className={`w-full p-3 rounded-lg outline-none border focus:border-accent  ${className ? "" : "border-light/25 bg-gray-800"}`}
    />
  )
}
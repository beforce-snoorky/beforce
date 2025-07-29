interface InputProps {
  id: string
  name: string
  type: string
  placeholder?: string
  autoComplete?: string
  className?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}

export function Input(props: InputProps) {
  return (
    <input
      id={props.id}
      name={props.name}
      type={props.type}
      placeholder={props.placeholder}
      autoComplete={props.autoComplete}
      value={props.value}
      className={`w-full p-3 rounded-lg outline-none border focus:border-accent  ${props.className ? "" : "border-light/25 bg-gray-800"}`}
      onChange={props.onChange}
      aria-required={props.required}
      required={props.required}
    />
  )
}
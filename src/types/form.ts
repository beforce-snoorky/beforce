export interface InputProps {
  id: string
  name: string
  type: string
  placeholder?: string
  autoComplete?: string
  className?: string
  required?: boolean
}

export interface ButtonProps {
  isPending: boolean
  type: "submit" | "reset" | "button"
  className?: string
  children: React.ReactNode
}
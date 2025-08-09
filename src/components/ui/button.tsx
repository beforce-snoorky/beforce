interface ButtonProps {
  isPending?: boolean
  type?: "submit" | "reset" | "button"
  variant?: "primary" | "secondary"
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export function Button(props: ButtonProps) {
  const baseStyles = "w-full py-3 px-4 inline-flex items-center justify-center gap-2 text-sm font-medium rounded-lg transition-colors duration-200"

  const variants = {
    primary: "border border-accent bg-accent text-white",
    secondary: "border border-surface bg-light text-gray-800",
  }

  return (
    <button
      type={props.type}
      disabled={props.isPending}
      onClick={props.onClick}
      aria-busy={props.isPending}
      className={`${baseStyles} ${variants[props.variant || "primary"]} ${props.className}`}
    >
      {props.isPending ? (
        <>
          <div className="animate-spin size-5 mr-2 rounded-full border-2 border-white border-r-transparent" />
          <span>Carregando...</span>
        </>
      ) : (
        props.children
      )}
    </button>
  )
}
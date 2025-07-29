interface ButtonProps {
  isPending: boolean
  type: "submit" | "reset" | "button"
  className?: string
  children: React.ReactNode
}

export function Button({ isPending, type, className, children }: ButtonProps) {
  return (
    <button
      type={type}
      className={`w-full font-medium flex justify-center items-center p-3 rounded-lg disabled:cursor-not-allowed transition-colors duration-200 bg-accent text-light ${className}`}
      aria-busy={isPending}
      disabled={isPending}
    >
      {isPending ?
        <>
          <div className="animate-spin w-5 h-5 mr-2 rounded-full border-solid border-2 border-current border-r-transparent" />
          <span>Entrando...</span>
        </> : children}
    </button>
  )
}
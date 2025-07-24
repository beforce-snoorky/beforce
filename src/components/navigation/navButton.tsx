import { NavButtonProps } from "@/types/navigation"

export function NavButton({ label, icon, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className="py-3 px-3 rounded-full shadow-sm border border-surface bg-accent text-light"
      aria-label={label}
    >
      <span className="w-4.5 h-4.5">{icon}</span>
    </button>
  )
}
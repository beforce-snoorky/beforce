export function Icon({ style, icon }: { style?: string, icon: React.ReactNode }) {
  return (
    <div className={`size-7 rounded-lg flex items-center justify-center ${style ? style : "text-accent bg-accent/10"}`}>
      {icon}
    </div>
  )
}
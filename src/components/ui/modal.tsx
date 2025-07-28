export function Modal({ onClose, children }: { onClose: () => void, children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 bg-dark/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div className="absolute inset-0 flex items-end justify-center pointer-events-auto">
          {children}
        </div>
      </div>
    </>
  )
}
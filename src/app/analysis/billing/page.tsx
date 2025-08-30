import { Hourglass } from "ldrs/react"
import "ldrs/react/Hourglass.css"

export default function BillingPage() {
  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <Hourglass size="40" bgOpacity="0.1" speed="1.75" color="#fa0d1d" />
        <h1 className="text-2xl font-semibold">Em breve</h1>
        <p className="text-sm max-w-lg mx-auto text-dark/75">
          Estamos desenvolvendo novos recursos para otimizar sua experiência com tecnologia e automação.
        </p>
      </div>
    </div>
  )
}
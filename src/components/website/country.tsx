"use client"

import { countryNameToCode } from "@/utils/countries"
import { CountryData } from "@/types/website"
import { useEffect, useState } from "react"

export function WorldMap({ country }: { country: CountryData[] }) {
  const [svgContent, setSvgContent] = useState<string>("")

  const activeCountryCodes = country.map((countryItem) => countryNameToCode[countryItem.country]).filter(Boolean)

  useEffect(() => {
    const fetchSvg = async () => {
      const res = await fetch("/world.svg")
      const text = await res.text()
      setSvgContent(text)
    }

    fetchSvg()
  }, [])

  useEffect(() => {
    if (!svgContent) return

    const timeout = setTimeout(() => {
      activeCountryCodes.forEach((countryCode) => {
        const countryElement = document.querySelector(`.${countryCode}`)
        if (countryElement) {
          const element = countryElement as HTMLElement
          element.style.fill = "#fa0d1d"
          element.style.stroke = "#fa0d1d"
        }
      })
    }, 0)

    return () => clearTimeout(timeout)
  }, [svgContent, activeCountryCodes])

  return (
    <div className="col-span-8 xl:col-span-5 rounded-xl border border-surface bg-light">
      <div className="relative">
        <div className="w-full xl:h-76 overflow-hidden">
          <div dangerouslySetInnerHTML={{ __html: svgContent }} className="xl:ml-25 w-full h-full" />
        </div>
        {country.length > 0 && (
          <div className="max-xl:w-full max-xl:mt-3.5 xl:absolute xl:left-2 xl:bottom-2 xl:rounded-xl overflow-hidden border border-surface">
            <table className="w-full text-xs bg-light">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-start font-medium uppercase w-32 text-gray-500">País</th>
                  <th className="py-3 px-4 text-start font-medium uppercase w-10 text-gray-500">Usuários</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {country.slice(0, 6).map((item) => (
                  <tr key={item.country} className="even:bg-gray-100">
                    <td className="py-3 px-4 whitespace-nowrap w-32 max-w-32 truncate text-gray-800">{item.country}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-800">{Number(item.activeUsers) + Number(item.newUsers)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
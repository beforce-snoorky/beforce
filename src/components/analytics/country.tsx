"use client"

import { CountryData } from "@/types/analytics"
import { scaleLinear } from "d3"
import { Feature, FeatureCollection, Geometry } from "geojson"
import { Globe } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import { Tooltip } from "react-tooltip"
import { feature } from "topojson-client"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

const countryNameAliasMap: Record<string, string> = {
  "united states": "united states of america",
  "usa": "united states of america",
  "russia": "russian federation",
  "south korea": "korea, republic of",
  "north korea": "korea, democratic people's republic of",
  "iran": "iran, islamic republic of",
  "vietnam": "viet nam",
  "venezuela": "venezuela, bolivarian republic of",
  "syria": "syrian arab republic",
  "moldova": "moldova, republic of",
  "laos": "lao people's democratic republic",
  "tanzania": "tanzania, united republic of",
  "bolivia": "bolivia, plurinational state of",
  "brunei": "brunei darussalam",
  "macedonia": "north macedonia",
  "palestine": "palestine, state of",
  "czech republic": "czechia",
}

export default function WorldMapChart({ country }: { country: CountryData[] }) {
  const [geographiesData, setGeographiesData] = useState<Feature<Geometry>[]>([])

  useEffect(() => {
    fetch(geoUrl).then(res => res.json()).then((topology) => {
      const geojson = feature(topology, topology.objects.countries) as FeatureCollection
      setGeographiesData(geojson.features)
    })
      .catch(console.error)
  }, [])

  const countryMap = useMemo(() => {
    const map = new Map<string, CountryData>()
    country?.forEach((d) => {
      const originalName = d.country.toLowerCase()
      const normalizedName = countryNameAliasMap[originalName] || originalName
      map.set(normalizedName, d)
    })
    return map
  }, [country])

  const maxValue = Math.max(...country.map((c) => Number(c.newUsers) || 0))
  const colorScale = scaleLinear<string>().domain([0, maxValue || 1]).range(["#ffe5e7", "#fa0d1d"])

  return (
    <div className="order-7 md:col-span-2 lg:col-span-3 xl:col-span-2 p-4 pb-4 rounded-xl border border-surface bg-light">
      <Tooltip id="world-map" style={{ fontSize: "14px", zIndex: 9999 }} />
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Usuários por País</h2>
      </div>
      <p className="text-sm mb-4">Distribuição de usuários por localização geográfica</p>
      <hr className="w-full opacity-25" />
      <div className="relative w-full aspect-[2/1]">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 150 }}
          width={800}
          height={400}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={geographiesData}>
            {({ geographies }: { geographies: Feature<Geometry>[] }) =>
              geographies.map((geo, index) => {
                const name = (geo.properties?.name as string)?.toLowerCase()
                const data = name && countryMap.get(name)
                const fill = data ? colorScale(Number(data.newUsers)) : "#e5e7eb"

                return (
                  <Geography
                    key={index}
                    geography={geo}
                    fill={fill}
                    data-tooltip-id="world-map"
                    data-tooltip-html={
                      data
                        ? `<strong>${geo.properties?.name}</strong><br/>
                           Novos: ${data.newUsers}<br/>
                           Ativos: ${data.activeUsers}<br/>
                           Engajados: ${data.engagedSessions}`
                        : undefined
                    }
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
    </div>
  )
}

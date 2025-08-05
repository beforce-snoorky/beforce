declare module "react-simple-maps" {
  import * as React from "react"
  export const ComposableMap: React.FC<Record<string, unknown>>
  export const Geographies: React.FC<Record<string, unknown>>
  export const Geography: React.FC<Record<string, unknown>>
}

declare module "topojson-client" {
  export function feature(topology: unknown, object: unknown): unknown
}
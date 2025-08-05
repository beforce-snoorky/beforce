declare module "react-simple-maps" {
  import * as React from "react";
  export const ComposableMap: React.FC<any>;
  export const Geographies: React.FC<any>;
  export const Geography: React.FC<any>;
}

declare module "topojson-client" {
  export function feature(topology: any, object: any): any;
}
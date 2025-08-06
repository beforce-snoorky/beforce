export interface Websites {
  id: string
  business_id: string
  period: string
  data: {
    city: CityData[]
    country: CountryData[]
    devices: DeviceData[]
    language: LanguageData[]
    origem: SourceData[]
    pages: PageData[]
    system: SystemData[]
    users: UsersData
  }
  created_at: string
}

export interface CityData {
  city: string
  activeUsers: string
  engagedSessions: string
  newUsers: string
}

export interface CountryData {
  country: string
  activeUsers: string
  engagedSessions: string
  newUsers: string
}

export interface DeviceData {
  deviceCategory: string
  activeUsers: string
}

export interface LanguageData {
  language: string
  activeUsers: string
  newUsers: string
}

export interface SourceData {
  sessionDefaultChannelGroup: string
  sessions: string
}

export interface PageData {
  pagePath: string
  activeUsers: string
  screenPageViews: string
  screenPageViewsPerUser: string
}

export interface SystemData {
  operatingSystem: string
  activeUsers: string
}

export interface UsersData {
  averageSessionDuration: string
  newUsers: string
  totalUsers: string
}
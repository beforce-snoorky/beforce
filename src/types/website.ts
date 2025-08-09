export interface Websites {
  id: string
  business_id: string
  period: string
  data: {
    users: UsersData
    source: SourceData[]
    system: SystemData[]
    devices: DeviceData[]
    pages: PageData[]
    country: CountryData[]
    city: CityData[]
  }
  created_at: string
}

export interface UsersData {
  totalUsers: string
  newUsers: string
  averageSessionDuration: string
  engagementRate: string
}

export interface SourceData {
  sessionDefaultChannelGroup: string
  sessions: string
}

export interface SystemData {
  operatingSystem: string
  activeUsers: string
}

export interface DeviceData {
  deviceCategory: string
  activeUsers: string
}

export interface PageData {
  pagePath: string
  screenPageViews: string
  activeUsers: string
  screenPageViewsPerUser: string
}

export interface CountryData {
  countryId: string
  country: string
  activeUsers: string
  newUsers: string
  engagedSessions: string
}

export interface CityData {
  city: string
  activeUsers: string
  newUsers: string
  engagedSessions: string
}
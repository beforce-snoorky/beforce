import type {
	CachedWebsiteMonth,
	CityData,
	CountryData,
	DeviceData,
	MetricValue,
	PagesData,
	SourceData,
	SystemData,
	TranslateFn,
	UsersData,
	WebsitePageData,
	WebsiteReport,
} from "@/types/website"
import {
	buildCacheKey as buildGenericCacheKey,
	cleanupCache,
	readCachedMonth as readGenericCachedMonth,
	writeCachedMonth as writeGenericCachedMonth,
} from "@/utils/cache"
import { formatMonthYear, normalizeReferenceMonth } from "@/utils/date"
import { asNullableString, asString } from "@/utils/parsing"

export const WEBSITE_SERVICE_ID = "cff78bc9-fe8a-4715-bf4d-7285d10cf3ca"
export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000
export const CACHE_MAX_MONTHS_PER_COMPANY = 6
const CACHE_PREFIX = "website:reports:"
export { asNullableString, asString, normalizeReferenceMonth }

export function emptyWebsitePageData(companyId: string): WebsitePageData {
	return { companyId, websiteDomain: null, referenceMonths: [], appliedReferenceMonth: null, report: null }
}

export function unwrapPayloadRoot(value: unknown): Record<string, unknown> {
	const payloadRecord = asRecord(value)
	if (!payloadRecord) return {}

	const nestedData = asRecord(payloadRecord.data)
	return nestedData ?? payloadRecord
}

function asRecord(value: unknown): Record<string, unknown> | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null
	return value as Record<string, unknown>
}

export function normalizeUsersData(value: unknown): UsersData {
	const record = asRecord(value)

	return {
		totalUsers: asMetricValue(record?.totalUsers),
		newUsers: asMetricValue(record?.newUsers),
		averageSessionDuration: asMetricValue(record?.averageSessionDuration),
		engagementRate: asMetricValue(record?.engagementRate),
	}
}

export function normalizeSourceData(value: unknown): SourceData[] {
	return asArrayOfRecords(value).map((entry) => ({
		sessionDefaultChannelGroup: asString(entry.sessionDefaultChannelGroup) || "Unassigned",
		sessions: asMetricValue(entry.sessions),
	}))
}

export function normalizeSystemData(value: unknown): SystemData[] {
	return asArrayOfRecords(value).map((entry) => ({
		operatingSystem: asString(entry.operatingSystem) || "(not set)",
		activeUsers: asMetricValue(entry.activeUsers),
	}))
}

export function normalizeDeviceData(value: unknown): DeviceData[] {
	return asArrayOfRecords(value).map((entry) => ({
		deviceCategory: asString(entry.deviceCategory) || "Unknown",
		activeUsers: asMetricValue(entry.activeUsers),
	}))
}

export function normalizePagesData(value: unknown): PagesData[] {
	return asArrayOfRecords(value).map((entry) => ({
		pagePath: asString(entry.pagePath) || "/",
		activeUsers: asMetricValue(entry.activeUsers),
		screenPageViews: asMetricValue(entry.screenPageViews),
		screenPageViewsPerUser: asMetricValue(entry.screenPageViewsPerUser),
	}))
}

export function normalizeCityData(value: unknown): CityData[] {
	return asArrayOfRecords(value).map((entry) => ({
		city: asString(entry.city) || "Unknown",
		newUsers: asMetricValue(entry.newUsers),
		activeUsers: asMetricValue(entry.activeUsers),
		engagedSessions: asMetricValue(entry.engagedSessions),
	}))
}

export function normalizeCountryData(value: unknown): CountryData[] {
	return asArrayOfRecords(value).map((entry) => ({
		country: asString(entry.country) || "Unknown",
		activeUsers: asMetricValue(entry.activeUsers),
		newUsers: asMetricValue(entry.newUsers),
	}))
}

function asMetricValue(value: unknown): MetricValue {
	if (typeof value === "number" && Number.isFinite(value)) return value

	if (typeof value === "string") {
		const normalized = value.trim()
		if (!normalized) return 0

		const numericString = normalized.replace(",", ".")
		if (/^-?\d+(\.\d+)?$/.test(numericString)) {
			const numericValue = Number(numericString)
			if (Number.isFinite(numericValue)) return numericValue
		}

		return normalized
	}

	return 0
}

function asArrayOfRecords(value: unknown): Record<string, unknown>[] {
	if (!Array.isArray(value)) return []

	return value.filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === "object"))
}

export function sanitizeDomain(domain: string | null | undefined): string | null {
	const normalized = (domain ?? "")
		.trim()
		.replace(/^https?:\/\//i, "")
		.replace(/\/+$/, "")
	return normalized || null
}

export function cleanupWebsiteCache({ ttl, maxMonthsPerCompany }: { ttl: number; maxMonthsPerCompany: number }) {
	cleanupCache({ prefix: CACHE_PREFIX, ttl, maxMonthsPerCompany, parseData: normalizeWebsiteReport })
}

function isWebsiteReport(value: unknown): value is WebsiteReport {
	if (!value || typeof value !== "object" || Array.isArray(value)) return false

	const report = value as Record<string, unknown>

	if (typeof report.id !== "string") return false
	if (typeof report.company_id !== "string") return false
	if (typeof report.service_id !== "string") return false
	if (typeof report.reference_month !== "string") return false
	if (!report.data || typeof report.data !== "object" || Array.isArray(report.data)) return false

	if (typeof report.created_at !== "string" && report.created_at !== null) return false

	return true
}

function normalizeWebsiteReport(value: unknown): WebsiteReport | null {
	if (!isWebsiteReport(value)) return null

	const normalizedReferenceMonth = normalizeReferenceMonth(value.reference_month)
	if (!normalizedReferenceMonth) return null

	return { ...value, reference_month: normalizedReferenceMonth }
}

export function buildCacheKey(companyId: string, referenceMonth: string | null): string | null {
	return buildGenericCacheKey({ prefix: CACHE_PREFIX, companyId, referenceMonth })
}

export function readCachedMonth({
	cacheKey,
	companyId,
	referenceMonth,
	ttl,
}: {
	cacheKey: string
	companyId: string
	referenceMonth: string
	ttl: number
}): CachedWebsiteMonth | null {
	return readGenericCachedMonth({
		cacheKey,
		companyId,
		referenceMonth,
		ttl,
		parseData: normalizeWebsiteReport,
		getCompanyId: (report) => report.company_id,
		getReferenceMonth: (report) => report.reference_month,
	})
}

export function buildClientPageData({
	baseData,
	report,
	referenceMonth,
}: {
	baseData: WebsitePageData
	report: WebsiteReport | null
	referenceMonth: string
}): WebsitePageData {
	const normalizedReferenceMonth = normalizeReferenceMonth(referenceMonth)
	const safeReferenceMonth = normalizedReferenceMonth ?? baseData.appliedReferenceMonth

	return { ...baseData, appliedReferenceMonth: safeReferenceMonth, report }
}

export function writeCachedMonth({ cacheKey, report }: { cacheKey: string; report: WebsiteReport }) {
	writeGenericCachedMonth({ cacheKey, data: report })
}

export function formatReferenceMonthLabel(referenceMonth: string, locale: string): string {
	const normalized = normalizeReferenceMonth(referenceMonth)
	if (!normalized) return referenceMonth

	const [year, month] = normalized.split("-")
	const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1))

	return formatMonthYear(date, locale)
}

export function buildWebsiteHref(domain: string | null | undefined, path: string): string {
	const normalizedDomain = sanitizeDomain(domain)
	const normalizedPath = path.startsWith("/") ? path : `/${path}`

	if (!normalizedDomain) return "#"

	return `https://${normalizedDomain}${normalizedPath}`
}

export function formatMetricValue(value: MetricValue, locale: string): string {
	if (typeof value === "number" && Number.isFinite(value)) {
		return new Intl.NumberFormat(locale).format(value)
	}

	if (typeof value === "string") {
		const normalized = value.trim()
		if (!normalized) return "0"

		const numericString = normalized.replace(",", ".")
		if (/^-?\d+(\.\d+)?$/.test(numericString)) {
			const parsed = Number(numericString)
			if (Number.isFinite(parsed)) return new Intl.NumberFormat(locale).format(parsed)
		}

		return normalized
	}

	return "0"
}

export function toNumber(value: MetricValue): number {
	if (typeof value === "number" && Number.isFinite(value)) return value

	if (typeof value === "string") {
		const normalized = value.trim().replace(",", ".")
		const sanitized = normalized.replace(/[^\d.-]/g, "")
		const parsed = Number(sanitized)
		if (Number.isFinite(parsed)) return parsed
	}

	return 0
}

export function translateSourceChannel(channel: string, translate: TranslateFn): string {
	const channelMap: Record<string, string> = {
		"Organic Social": "organicSocial",
		"Organic Search": "organicSearch",
		"Referral": "referral",
		"Direct": "direct",
		"Paid Search": "paidSearch",
		"Paid Social": "paidSocial",
		"Display": "display",
		"Email": "email",
		"Affiliates": "affiliates",
		"Other": "other",
		"Unassigned": "unassigned",
	}

	const channelKey = channelMap[channel] ?? "other"
	return translate(`channels.${channelKey}`)
}

export function normalizeSystemName(value: string): string {
	const systemsMap: Record<string, string> = {
		"iOS": "iOS",
		"Macintosh": "iOS",
		"Linux": "Linux",
		"Android": "Android",
		"ChromeOS": "ChromeOS",
		"Chrome OS": "ChromeOS",
		"Windows": "Windows",
		"(not set)": "Windows",
	}

	return systemsMap[value] ?? value
}

export const countryNameToCode: Record<string, string> = {
	// "Andorra": "AND",
	"United Arab Emirates": "ARE",
	"Afghanistan": "AFG",
	// "Antigua and Barbuda": "ATG",
	// "Anguilla": "AIA",
	"Albania": "ALB",
	"Armenia": "ARM",
	"Angola": "AGO",
	// "Antarctica": "ATA",
	"Argentina": "ARG",
	// "American Samoa": "ASM",
	"Austria": "AUT",
	"Australia": "AUS",
	// "Aruba": "ABW",
	// "Åland Islands": "ALA",
	"Azerbaijan": "AZE",
	"French Southern Territories": "ATF",

	"Bosnia and Herzegovina": "BIH",
	// "Barbados": "BRB",
	"Bangladesh": "BGD",
	"Belgium": "BEL",
	"Burkina Faso": "BFA",
	"Bulgaria": "BGR",
	// "Bahrain": "BHR",
	"Burundi": "BDI",
	"Benin": "BEN",
	// "Saint Barthélemy": "BLM",
	// "Bermuda": "BMU",
	"Brunei Darussalam": "BRN",
	"Bolivia, Plurinational State of": "BOL",
	"Brazil": "BRA",
	"Bahamas": "BHS",
	"Bhutan": "BTN",
	// "Bouvet Island": "BVT",
	"Botswana": "BWA",
	"Belarus": "BLR",
	"Belize": "BLZ",

	"Canada": "CAN",
	// "Cocos (Keeling) Islands": "CCK",
	"Congo, Democratic Republic of the": "COD",
	"Central African Republic": "CAF",
	"Congo": "COG",
	"Switzerland": "CHE",
	"Côte d'Ivoire": "CIV",
	// "Cook Islands": "COK",
	"Chile": "CHL",
	"Cameroon": "CMR",
	"China": "CHN",
	"Colombia": "COL",
	"Costa Rica": "CRI",
	"Cuba": "CUB",
	// "Cabo Verde": "CPV",
	// "Curaçao": "CUW",
	// "Christmas Island": "CXR",
	"Cyprus": "CYP",
	"Czechia": "CZE",
	// "Comoros": "COM",
	// "Cayman Islands": "CYM",

	"Germany": "DEU",
	"Djibouti": "DJI",
	"Denmark": "DNK",
	// "Dominica": "DMA",
	"Dominican Republic": "DOM",
	"Algeria": "DZA",

	"Ecuador": "ECU",
	"Estonia": "EST",
	"Egypt": "EGY",
	"Western Sahara": "ESH",
	"Eritrea": "ERI",
	"Spain": "ESP",
	"Ethiopia": "ETH",

	"Finland": "FIN",
	"Fiji": "FJI",
	"Falkland Islands (Malvinas)": "FLK",
	// "Micronesia, Federated States of": "FSM",
	// "Faroe Islands": "FRO",
	"France": "FRA",

	"Gabon": "GAB",
	"United Kingdom of Great Britain and Northern Ireland": "GBR",
	// "Grenada": "GRD",
	"Georgia": "GEO",
	"French Guiana": "GUF",
	// "Guernsey": "GGY",
	"Ghana": "GHA",
	// "Gibraltar": "GIB",
	"Greenland": "GRL",
	"Gambia": "GMB",
	"Guinea": "GIN",
	// "Guadeloupe": "GLP",
	"Equatorial Guinea": "GNQ",
	"Greece": "GRC",
	"Guatemala": "GTM",
	// "Guam": "GUM",
	"Guinea-Bissau": "GNB",
	"Guyana": "GUY",

	// "Hong Kong": "HKG",
	// "Heard Island and McDonald Islands": "HMD",
	"Honduras": "HND",
	"Croatia": "HRV",
	"Haiti": "HTI",
	"Hungary": "HUN",

	"Indonesia": "IDN",
	"Ireland": "IRL",
	"Israel": "ISR",
	// "Isle of Man": "IMN",
	"India": "IND",
	// "British Indian Ocean Territory": "IOT",
	"Iraq": "IRQ",
	"Iran": "IRN",
	"Iceland": "ISL",
	"Italy": "ITA",

	// "Jersey": "JEY",
	"Jamaica": "JAM",
	"Jordan": "JOR",
	"Japan": "JPN",

	"Kenya": "KEN",
	"Kyrgyzstan": "KGZ",
	"Cambodia": "KHM",
	// "Kiribati": "KIR",
	// "Saint Kitts and Nevis": "KNA",
	"South Korea": "KOR",
	"Kuwait": "KWT",
	"Kazakhstan": "KAZ",

	"Lao People's Democratic Republic": "LAO",
	"Lebanon": "LBN",
	// "Saint Lucia": "LCA",
	// "Liechtenstein": "LIE",
	"Sri Lanka": "LKA",
	"Liberia": "LBR",
	"Lesotho": "LSO",
	"Lithuania": "LTU",
	// "Luxembourg": "LUX",
	"Latvia": "LVA",
	"Libya": "LBY",

	"Morocco": "MAR",
	// "Monaco": "MCO",
	"Moldova": "MDA",
	"Montenegro": "MNE",
	// "Saint Martin (French part)": "MAF",
	"Madagascar": "MDG",
	// "Marshall Islands": "MHL",
	"North Macedonia": "MKD",
	"Mali": "MLI",
	"Myanmar": "MMR",
	"Mongolia": "MNG",
	// "Macao": "MAC",
	// "Northern Mariana Islands": "MNP",
	// "Martinique": "MTQ",
	"Mauritania": "MRT",
	// "Montserrat": "MSR",
	// "Malta": "MLT",
	// "Mauritius": "MUS",
	// "Maldives": "MDV",
	"Malawi": "MWI",
	"Mexico": "MEX",
	"Malaysia": "MYS",
	"Mozambique": "MOZ",
	// "Mayotte": "MYT",

	"Namibia": "NAM",
	"New Caledonia": "NCL",
	"Niger": "NER",
	// "Norfolk Island": "NFK",
	"Nigeria": "NGA",
	"Nicaragua": "NIC",
	"Netherlands": "NLD",
	"Norway": "NOR",
	"Nepal": "NPL",
	// "Nauru": "NRU",
	// "Niue": "NIU",
	"New Zealand": "NZL",

	"Oman": "OMN",

	"Panama": "PAN",
	"Peru": "PER",
	// "French Polynesia": "PYF",
	"Papua New Guinea": "PNG",
	"Philippines": "PHL",
	"Pakistan": "PAK",
	"Poland": "POL",
	// "Pitcairn": "PCN",
	"Puerto Rico": "PRI",
	"Palestine": "PSE",
	"Portugal": "PRT",
	// "Palau": "PLW",
	"Paraguay": "PRY",
	"North Korea": "PRK",

	"Qatar": "QAT",

	// "Réunion": "REU",
	"Romania": "ROU",
	"Russia": "RUS",
	"Rwanda": "RWA",

	"Saudi Arabia": "SAU",
	"Solomon Islands": "SLB",
	// "Seychelles": "SYC",
	"Sudan": "SDN",
	"Sweden": "SWE",
	// "Singapore": "SGP",
	// "Saint Helena, Ascension and Tristan da Cunha": "SHN",
	"Slovenia": "SVN",
	// "Svalbard and Jan Mayen": "SJM",
	"Slovakia": "SVK",
	"Sierra Leone": "SLE",
	// "San Marino": "SMR",
	"Senegal": "SEN",
	"Somalia": "SOM",
	"Suriname": "SUR",
	"South Sudan": "SSD",
	// "Sao Tome and Principe": "STP",
	"El Salvador": "SLV",
	// "Sint Maarten (Dutch part)": "SXM",
	"Syrian Arab Republic": "SYR",
	"Eswatini": "SWZ",
	"Serbia": "SRB",
	// "South Georgia and the South Sandwich Islands": "SGS",
	// "Saint Pierre and Miquelon": "SPM",

	// "Turks and Caicos Islands": "TCA",
	"Chad": "TCD",
	"Togo": "TGO",
	"Thailand": "THA",
	"Tajikistan": "TJK",
	// "Tokelau": "TKL",
	"Timor-Leste": "TLS",
	"Turkmenistan": "TKM",
	"Tunisia": "TUN",
	// "Tonga": "TON",
	"Türkiye": "TUR",
	"Trinidad and Tobago": "TTO",
	// "Tuvalu": "TUV",
	"Taiwan, Province of China": "TWN",
	"Tanzania": "TZA",

	"Ukraine": "UKR",
	"Uganda": "UGA",
	// "United States Minor Outlying Islands": "UMI",
	"United States": "USA",
	"Uruguay": "URY",
	"Uzbekistan": "UZB",

	// "Holy See": "VAT",
	// "Saint Vincent and the Grenadines": "VCT",
	"Venezuela, Bolivarian Republic of": "VEN",
	// "Virgin Islands, British": "VGB",
	// "Virgin Islands, U.S.": "VIR",
	"Vietnam": "VNM",
	"Vanuatu": "VUT",

	// "Wallis and Futuna": "WLF",
	// "Samoa": "WSM",

	"Kosovo": "XKX",

	"Yemen": "YEM",

	"South Africa": "ZAF",
	"Zambia": "ZMB",
	"Zimbabwe": "ZWE",
}

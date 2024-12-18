// services/types.ts
export interface GeocodeResult {
	latitude: number
	longitude: number
	formattedAddress?: string
	confidence: number
	source: 'mapbox'
	metadata?: {
		id: string
		place_name: string
		place_type: string[]
		relevance: number
		properties: Record<string, any>
		context?: Array<{
			id: string
			text: string
			wikidata?: string
			short_code?: string
		}>
	}
}

export interface GeocodingOptions {
	apiKey?: string
	timeout?: number
	maxRetries?: number
	types?: Array<
		| 'country'
		| 'region'
		| 'postcode'
		| 'district'
		| 'place'
		| 'locality'
		| 'neighborhood'
		| 'address'
		| 'poi'
	>
	limit?: number
	language?: string
	countries?: string[]
	forceFresh?: boolean // Add this property
}
export interface CacheEntry {
	results: GeocodeResult[]
	timestamp: number
}

export type GeocodeError = {
	code: 'TIMEOUT' | 'SERVICE_ERROR' | 'RATE_LIMIT' | 'INVALID_REQUEST'
	message: string
	originalError?: Error
}

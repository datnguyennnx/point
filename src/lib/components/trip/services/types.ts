export interface GeocodeResult {
	latitude: number
	longitude: number
	formattedAddress?: string
	confidence: number
	source: 'nominatim' | 'google' | 'pseudo'
	metadata?: Record<string, any>
}

export interface GeocodingOptions {
	apiKey?: string
	preferredService?: 'nominatim' | 'google'
	forceFresh?: boolean
	timeout?: number
	maxRetries?: number
}

export interface CacheEntry {
	results: GeocodeResult[]
	timestamp: number
	source: 'nominatim' | 'google' | 'pseudo'
}

export type GeocodeError = {
	code: 'TIMEOUT' | 'SERVICE_ERROR' | 'RATE_LIMIT' | 'INVALID_REQUEST'
	message: string
	originalError?: Error
}

import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public'
import type { GeocodeResult, GeocodingOptions, CacheEntry, GeocodeError } from './types'
import { RateLimiter } from './rate-limiter'
import { Logger } from './logger'

export class OptimizedGeocodingService {
	private static cache = new Map<string, CacheEntry>()
	private static readonly CACHE_DURATION = 1000 * 60 * 60 // 1 hour
	private static readonly DEFAULT_TIMEOUT = 10000 // 10 seconds
	private static readonly MAX_RETRIES = 3
	private static rateLimiter = new RateLimiter({
		maxRequests: 600, // Mapbox limit is 600 requests per minute
		timeWindow: 1000 * 60, // 1 minute
	})

	private static generateCacheKey(query: string, options?: GeocodingOptions): string {
		const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, ' ')
		const optionsKey = options ? JSON.stringify(options) : ''
		return `${normalizedQuery}:${optionsKey}`
	}

	private static getCachedResults(cacheKey: string): GeocodeResult[] | null {
		const entry = this.cache.get(cacheKey)
		if (!entry) return null
		const isExpired = Date.now() - entry.timestamp > this.CACHE_DURATION
		if (isExpired) {
			this.cache.delete(cacheKey)
			return null
		}
		return entry.results
	}

	private static async rateLimitedFetch(
		url: string,
		retries = this.MAX_RETRIES,
		baseDelay = 1000,
	): Promise<Response> {
		for (let i = 0; i < retries; i++) {
			try {
				await this.rateLimiter.waitForToken()
				const response = await fetch(url)
				if (response.ok) return response
				if (response.status === 429) {
					const delay = baseDelay * Math.pow(2, i)
					await new Promise((resolve) => setTimeout(resolve, delay))
					continue
				}
				throw new Error(`HTTP ${response.status}: ${response.statusText}`)
			} catch (error) {
				if (i === retries - 1) throw error
				await new Promise((resolve) => setTimeout(resolve, baseDelay * Math.pow(2, i)))
			}
		}
		throw new Error('Max retries exceeded')
	}

	static async geocode(query: string, options: GeocodingOptions = {}): Promise<GeocodeResult[]> {
		if (!query?.trim()) {
			throw this.createGeocodeError('INVALID_REQUEST', 'Query cannot be empty')
		}

		const cacheKey = this.generateCacheKey(query, options)
		if (!options.forceFresh) {
			const cachedResults = this.getCachedResults(cacheKey)
			if (cachedResults) {
				Logger.debug('Cache hit for query:', query)
				return cachedResults
			}
		}

		const baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places'
		const params = new URLSearchParams({
			access_token: PUBLIC_MAPBOX_ACCESS_TOKEN,
			limit: (options.limit || 5).toString(),
			types: (options.types || ['place', 'address', 'poi']).join(','),
			language: options.language || 'en',
		})

		if (options.countries?.length) {
			params.append('country', options.countries.join(','))
		}

		const encodedQuery = encodeURIComponent(query.trim())
		const url = `${baseUrl}/${encodedQuery}.json?${params}`

		try {
			const response = await this.rateLimitedFetch(url)
			const data = await response.json()

			const results: GeocodeResult[] = data.features.map((feature: any) => ({
				latitude: feature.center[1],
				longitude: feature.center[0],
				formattedAddress: feature.place_name,
				confidence: feature.relevance,
				source: 'mapbox' as const,
				metadata: {
					id: feature.id,
					place_name: feature.place_name,
					place_type: feature.place_type,
					relevance: feature.relevance,
					properties: feature.properties,
					context: feature.context,
				},
			}))

			this.cache.set(cacheKey, {
				results,
				timestamp: Date.now(),
			})

			return results
		} catch (error) {
			Logger.error('Mapbox Geocoding Error:', error)
			throw this.createGeocodeError(
				'SERVICE_ERROR',
				'Mapbox geocoding service failed',
				error as Error,
			)
		}
	}

	private static createGeocodeError(
		code: GeocodeError['code'],
		message: string,
		originalError?: Error,
	): GeocodeError {
		return { code, message, originalError }
	}
}

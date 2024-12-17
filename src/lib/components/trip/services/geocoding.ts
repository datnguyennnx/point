// services/geocoding.service.ts
import type { GeocodeResult, GeocodingOptions, CacheEntry, GeocodeError } from './types'
import { RateLimiter } from './rate-limiter'
import { Logger } from './logger'

export class OptimizedGeocodingService {
	private static cache = new Map<string, CacheEntry>()
	private static readonly CACHE_DURATION = 1000 * 60 * 60 // 1 hour
	private static readonly DEFAULT_TIMEOUT = 5000 // 5 seconds
	private static readonly MAX_RETRIES = 3

	private static nominatimRateLimiter = new RateLimiter({
		maxRequests: 1,
		timeWindow: 1000, // 1 request per second
	})

	private static googleRateLimiter = new RateLimiter({
		maxRequests: 50,
		timeWindow: 1000 * 60, // 50 requests per minute
	})

	private static generateCacheKey(query: string, service?: string): string {
		const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, ' ')
		return `${normalizedQuery}:${service || 'default'}`
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
		rateLimiter: RateLimiter,
		retries = this.MAX_RETRIES,
		baseDelay = 1000,
	): Promise<Response> {
		for (let i = 0; i < retries; i++) {
			try {
				await rateLimiter.waitForToken()
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

	private static async nominatimGeocode(query: string): Promise<GeocodeResult[]> {
		const baseUrl = 'https://nominatim.openstreetmap.org/search'
		const params = new URLSearchParams({
			q: query.trim(),
			format: 'json',
			limit: '5',
			addressdetails: '1',
		})

		try {
			const response = await this.rateLimitedFetch(
				`${baseUrl}?${params}`,
				this.nominatimRateLimiter,
			)
			const data = await response.json()

			return data.map((result: any) => ({
				latitude: parseFloat(result.lat),
				longitude: parseFloat(result.lon),
				formattedAddress: this.formatAddress(result),
				confidence: this.calculateConfidence(result, 'nominatim'),
				source: 'nominatim' as const,
				metadata: {
					osmId: result.osm_id,
					importance: result.importance,
					originalAddress: result.address,
				},
			}))
		} catch (error) {
			Logger.error('Nominatim Geocoding Error:', error)
			throw this.createGeocodeError('SERVICE_ERROR', 'Nominatim service failed', error as Error)
		}
	}

	private static async googleMapsGeocode(query: string, apiKey: string): Promise<GeocodeResult[]> {
		const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json'
		const params = new URLSearchParams({
			address: query,
			key: apiKey,
		})

		try {
			const response = await this.rateLimitedFetch(`${baseUrl}?${params}`, this.googleRateLimiter)
			const data = await response.json()

			return data.results.map((result: any) => ({
				latitude: result.geometry.location.lat,
				longitude: result.geometry.location.lng,
				formattedAddress: result.formatted_address,
				confidence: this.calculateConfidence(result, 'google'),
				source: 'google' as const,
				metadata: {
					placeId: result.place_id,
					types: result.types,
					locationType: result.geometry.location_type,
				},
			}))
		} catch (error) {
			Logger.error('Google Maps Geocoding Error:', error)
			throw this.createGeocodeError('SERVICE_ERROR', 'Google Maps service failed', error as Error)
		}
	}

	private static generatePseudoCoordinates(query: string): GeocodeResult {
		const hash = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
		return {
			latitude: 30 + (hash % 50),
			longitude: -120 + (hash % 100),
			formattedAddress: `Estimated Location for: ${query}`,
			confidence: 0.1,
			source: 'pseudo' as const,
			metadata: {
				hash,
				generated: new Date().toISOString(),
			},
		}
	}

	static async geocode(query: string, options: GeocodingOptions = {}): Promise<GeocodeResult[]> {
		if (!query?.trim()) {
			throw this.createGeocodeError('INVALID_REQUEST', 'Query cannot be empty')
		}

		const cacheKey = this.generateCacheKey(query, options.preferredService)

		if (!options.forceFresh) {
			const cachedResults = this.getCachedResults(cacheKey)
			if (cachedResults) {
				Logger.debug('Cache hit for query:', query)
				return cachedResults
			}
		}

		const services: Promise<GeocodeResult[]>[] = []
		const timeout = options.timeout || this.DEFAULT_TIMEOUT

		if (options.preferredService === 'nominatim') {
			services.push(this.nominatimGeocode(query))
		} else if (options.preferredService === 'google' && options.apiKey) {
			services.push(this.googleMapsGeocode(query, options.apiKey))
		}

		// Add fallback services
		if (!services.length) {
			services.push(this.nominatimGeocode(query))
		}

		const timeoutPromise = new Promise<never>((_, reject) =>
			setTimeout(() => reject(this.createGeocodeError('TIMEOUT', 'Geocoding timeout')), timeout),
		)

		try {
			const results = await Promise.race([Promise.any(services), timeoutPromise])

			if (results.length > 0) {
				this.cache.set(cacheKey, {
					results,
					timestamp: Date.now(),
					source: options.preferredService || 'nominatim',
				})
				return results
			}

			return [this.generatePseudoCoordinates(query)]
		} catch (error) {
			Logger.error('Geocoding failed:', error)
			return [this.generatePseudoCoordinates(query)]
		}
	}

	private static calculateConfidence(result: any, source: 'nominatim' | 'google'): number {
		const weights = {
			addressCompleteness: 0.4,
			sourceReliability: 0.3,
			precision: 0.3,
		}

		const addressScore = result.address ? Object.keys(result.address).length / 10 : 0.5

		const sourceScore = source === 'google' ? 0.9 : 0.7

		const precisionScore =
			source === 'nominatim'
				? result.importance || 0.5
				: result.geometry?.location_type === 'ROOFTOP'
					? 1
					: 0.6

		return Math.min(
			1,
			Math.max(
				0,
				addressScore * weights.addressCompleteness +
					sourceScore * weights.sourceReliability +
					precisionScore * weights.precision,
			),
		)
	}

	private static formatAddress(result: any): string {
		const parts = []
		if (result.address) {
			if (result.address.city) parts.push(result.address.city)
			else if (result.address.town) parts.push(result.address.town)
			else if (result.address.village) parts.push(result.address.village)
			if (result.address.state) parts.push(result.address.state)
			if (result.address.country) parts.push(result.address.country)
		}
		return parts.length > 0 ? parts.join(', ') : result.display_name
	}

	private static createGeocodeError(
		code: GeocodeError['code'],
		message: string,
		originalError?: Error,
	): GeocodeError {
		return { code, message, originalError }
	}
}

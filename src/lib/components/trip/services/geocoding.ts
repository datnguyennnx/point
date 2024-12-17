//geocoding.ts
export interface GeocodeResult {
	latitude: number
	longitude: number
	formattedAddress?: string
	confidence?: number
}

export class GeocodingService {
	static async nominatimGeocode(query: string): Promise<GeocodeResult[]> {
		const baseUrl = 'https://nominatim.openstreetmap.org/search'
		const params = new URLSearchParams({
			q: query.trim(), // Ensure proper trimming
			format: 'json',
			limit: '5',
			addressdetails: '1', // Get detailed address information
		})

		try {
			const response = await fetch(`${baseUrl}?${params}`)
			const data = await response.json()

			return data.map((result: any) => ({
				latitude: parseFloat(result.lat),
				longitude: parseFloat(result.lon),
				formattedAddress: this.formatAddress(result),
				confidence: result.importance,
			}))
		} catch (error) {
			console.error('Nominatim Geocoding Error:', error)
			return []
		}
	}

	// Helper method to format addresses consistently
	private static formatAddress(result: any): string {
		const parts = []

		if (result.address) {
			// Add city/town/village
			if (result.address.city) parts.push(result.address.city)
			else if (result.address.town) parts.push(result.address.town)
			else if (result.address.village) parts.push(result.address.village)

			// Add state/province
			if (result.address.state) parts.push(result.address.state)

			// Add country
			if (result.address.country) parts.push(result.address.country)
		}

		// Fallback to display_name if we couldn't construct a good address
		return parts.length > 0 ? parts.join(', ') : result.display_name
	}

	// Google Maps Geocoding API (Requires API Key)
	static async googleMapsGeocode(query: string, apiKey: string): Promise<GeocodeResult[]> {
		const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json'
		const params = new URLSearchParams({
			address: query,
			key: apiKey,
		})

		try {
			const response = await fetch(`${baseUrl}?${params}`)
			const data = await response.json()

			return data.results.map((result: any) => ({
				latitude: result.geometry.location.lat,
				longitude: result.geometry.location.lng,
				formattedAddress: result.formatted_address,
				confidence: result.geometry.location_type === 'ROOFTOP' ? 1 : 0.5,
			}))
		} catch (error) {
			console.error('Google Maps Geocoding Error:', error)
			return []
		}
	}

	// Fallback Method: Generate Pseudo-Random Coordinates
	static generatePseudoCoordinates(query: string): GeocodeResult {
		// Create a deterministic but pseudo-random coordinate based on the query
		const hash = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

		return {
			latitude: 30 + (hash % 50), // Latitude between 30 and 80
			longitude: -120 + (hash % 100), // Longitude between -120 and -20
			formattedAddress: `Estimated Location for: ${query}`,
			confidence: 0.1,
		}
	}

	// Unified Geocoding Method
	static async geocode(
		query: string,
		options: {
			apiKey?: string
			preferredService?: 'nominatim' | 'google'
		} = {},
	): Promise<GeocodeResult[]> {
		let results: GeocodeResult[] = []

		// Try preferred service first
		if (options.preferredService === 'nominatim') {
			results = await this.nominatimGeocode(query)
		} else if (options.preferredService === 'google' && options.apiKey) {
			results = await this.googleMapsGeocode(query, options.apiKey)
		}

		// If no results, try Nominatim
		if (results.length === 0) {
			results = await this.nominatimGeocode(query)
		}

		// If still no results, generate pseudo-coordinates
		if (results.length === 0) {
			results = [this.generatePseudoCoordinates(query)]
		}

		return results
	}
}

// Example Usage
async function exampleGeocoding() {
	// Basic usage
	const usLocations = await GeocodingService.geocode('United States')
	console.log('US Locations:', usLocations)

	// With specific options
	const parisLocations = await GeocodingService.geocode('Paris', {
		preferredService: 'nominatim',
	})
	console.log('Paris Locations:', parisLocations)
}

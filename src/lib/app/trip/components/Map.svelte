<!-- Map.svelte -->
<script lang="ts">
import { MapLibre } from 'svelte-maplibre'
// Adjust import for CommonJS compatibility as suggested by Vite error
import maplibre from 'maplibre-gl'
const { Marker, Popup } = maplibre
import type { Map } from 'maplibre-gl' // Keep type import separate
import type { MapMarker } from '../types/types'

// Use state for reactive variables
let map = $state<Map | undefined>(undefined)
let markers = $state<{ [key: string]: maplibre.Marker }>({}) // Use maplibre.Marker type

// Props interface remains the same
const { markers: markersProp = [] } = $props<{
	markers?: MapMarker[]
}>()

function updateMarkers(newMarkers: MapMarker[]) {
	if (!map) return

	// Remove markers that are no longer in the list
	Object.keys(markers).forEach((key) => {
		if (!newMarkers.find((m) => `${m.lngLat[0]},${m.lngLat[1]}` === key)) {
			markers[key].remove()
			delete markers[key]
		}
	})

	// Add or update markers
	newMarkers.forEach((markerData) => {
		const key = `${markerData.lngLat[0]},${markerData.lngLat[1]}`
		if (!markers[key] && map) {
			// Check map instance again
			// Create popup using the destructured Popup
			const popup = new Popup({ offset: 25 }).setHTML(`<h2>${markerData.name}</h2>`)

			// Create marker using the destructured Marker
			const marker = new Marker().setLngLat(markerData.lngLat).setPopup(popup).addTo(map) // Use map instance

			markers[key] = marker
		}
	})
}

// Function to fly to a marker
export function flyToMarker(lngLat: [number, number], zoom: number = 12) {
	if (!map) return // Use map instance

	map.flyTo({
		// Use map instance
		center: lngLat,
		zoom,
		duration: 2000,
		essential: true,
	})
}

// Watch for changes in markers prop and map initialization
$effect(() => {
	if (map) {
		// Setup map event handlers once map is available
		map.on('mouseenter', 'clusters', () => {
			if (map) map.getCanvas().style.cursor = 'pointer'
		})
		map.on('mouseleave', 'clusters', () => {
			if (map) map.getCanvas().style.cursor = ''
		})

		// Update markers when map is ready or markersProp changes
		if (markersProp) {
			updateMarkers(markersProp)
		}
	}
})

// Export map instance for parent component
export function getMap(): Map | undefined {
	return map
}
</script>

<!-- Use MapLibre component -->
<MapLibre
	bind:map={map}
	class="h-full w-full"
	style={'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'}
	center={[105, 15]}
	zoom={5}
/>

<!-- Style block removed -->

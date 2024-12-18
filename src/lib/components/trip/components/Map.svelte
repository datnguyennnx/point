<!-- Map.svelte -->
<script lang="ts">
import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public'
import { onDestroy } from 'svelte'
import mapboxgl from 'mapbox-gl'
import type { Map, MapMouseEvent, GeoJSONFeature } from 'mapbox-gl'
import type { MapMarker } from '../types/types'

// Use state instead of let for reactive variables
let map = $state<mapboxgl.Map | null>(null)
let markers = $state<{ [key: string]: mapboxgl.Marker }>({})

// Add props interface for markers
const { markers: markersProp = [] } = $props<{
	markers?: MapMarker[]
}>()

// Define initialization function
function initMap(container: HTMLDivElement) {
	// Initialize map
	map = new mapboxgl.Map({
		container,
		style: 'mapbox://styles/mapbox/outdoors-v12',
		center: [105, 15],
		zoom: 5,
		accessToken: PUBLIC_MAPBOX_ACCESS_TOKEN,
	})

	// Setup map events and layers
	map.on('load', () => {
		if (!map) return
		setupEventHandlers(map)
	})

	// Cleanup on component destroy
	onDestroy(() => {
		// Remove all markers
		Object.values(markers).forEach((marker) => marker.remove())

		if (map) {
			map.remove()
		}
	})
}

function setupEventHandlers(map: mapboxgl.Map) {
	// Mouse enter/leave handlers remain the same
	map.on('mouseenter', 'clusters', () => {
		map.getCanvas().style.cursor = 'pointer'
	})
	map.on('mouseleave', 'clusters', () => {
		map.getCanvas().style.cursor = ''
	})
}

// Function to add or update markers
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

		if (!markers[key]) {
			// Create popup
			const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`<h2>${markerData.name}</h2>`)

			// Create marker
			const marker = new mapboxgl.Marker().setLngLat(markerData.lngLat).setPopup(popup).addTo(map)

			markers[key] = marker
		}
	})
}

// Function to fly to a marker
export function flyToMarker(lngLat: [number, number], zoom: number = 12) {
	if (!map) return

	map.flyTo({
		center: lngLat,
		zoom,
		duration: 2000,
		essential: true,
	})
}

// Watch for changes in markers prop
$effect(() => {
	if (map && markersProp) {
		updateMarkers(markersProp)
	}
})

// Export map instance for parent component
export function getMap(): mapboxgl.Map | null {
	return map
}
</script>

<div class="h-full w-full" use:initMap></div>

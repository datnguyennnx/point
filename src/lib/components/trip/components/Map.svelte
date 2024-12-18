<!-- Map.svelte -->

<script lang="ts">
import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public'
import { onDestroy } from 'svelte'
import mapboxgl from 'mapbox-gl'
import type { Map, MapMouseEvent, GeoJSONFeature } from 'mapbox-gl'
import type { Point, Feature, Geometry } from 'geojson'

// Use state instead of let for reactive variables
let map = $state<mapboxgl.Map | null>(null)

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

		map.addSource('earthquakes', {
			type: 'geojson',
			data: 'https://gist.githubusercontent.com/thedivtagguy/0a07453f2081be9c0f5b6fc2a2681a0f/raw/3c41dbbba93f88a78af1cf13e88443d2eed7d6ec/geodata.geojson',
			cluster: true,
			clusterMaxZoom: 14,
			clusterRadius: 50,
		})

		setupEventHandlers(map)
	})

	// Cleanup on component destroy
	onDestroy(() => {
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
</script>

<div class="h-full w-full" use:initMap></div>

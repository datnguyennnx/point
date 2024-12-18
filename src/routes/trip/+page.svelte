<!-- +page.svelte -->
<script lang="ts">
import SplitCanvas from '$lib/components/common/Canvas/SplitCanvas.svelte'
import TextEditor from '$lib/components/trip/components/TextEditor.svelte'
import {
	FullscreenControl,
	MapLibre,
	NavigationControl,
	DefaultMarker,
	Popup,
} from 'svelte-maplibre'
import { onMount } from 'svelte'
import type { MapMarker } from '$lib/components/trip/types/types'

// Create state
let markers = $state<MapMarker[]>([])
let map: any

// Function to handle map instance
function handleMapInit(event: CustomEvent) {
	map = event.detail
}

// Add marker function
function addMarker(marker: MapMarker) {
	markers = [...markers, marker]

	// Fly to the new marker location
	if (map) {
		map.flyTo({
			center: marker.lngLat,
			zoom: 12,
			duration: 2000,
			essential: true,
		})
	}
}
</script>

<SplitCanvas>
	<div slot="left" class="flex w-1/2 overflow-hidden rounded-md border">
		<div class="flex w-full flex-col overflow-hidden">
			<div class="no-scrollbar h-full w-full overflow-y-auto">
				<div class="w-full p-4">
					<TextEditor addMarker={addMarker} />
				</div>
			</div>
		</div>
	</div>
	<div slot="right" class="flex w-1/2 overflow-hidden rounded-md border">
		<MapLibre
			on:ready={handleMapInit}
			center={[108, 17]}
			zoom={5}
			class="h-full w-full"
			style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
		>
			<NavigationControl position="top-right" />
			<FullscreenControl position="top-right" />
			{#each markers as { lngLat, name, label }}
				<DefaultMarker lngLat={lngLat} draggable>
					<Popup offset={[0, -10]}>
						<div class="text-lg font-bold">{name}</div>
						<div class="text-sm">{label}</div>
					</Popup>
				</DefaultMarker>
			{/each}
		</MapLibre>
	</div>
</SplitCanvas>

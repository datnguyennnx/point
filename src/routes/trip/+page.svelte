<!-- +page.svelte -->
<script lang="ts">
import SplitCanvas from '$lib/components/common/Canvas/SplitCanvas.svelte'
import TextEditor from '$lib/app/trip/components/TextEditor.svelte'
import type { MapMarker } from '$lib/app/trip/types/types'
import Map from '$lib/app/trip/components/Map.svelte'

// Create state
let markers = $state<MapMarker[]>([])
let mapComponent: any

// Add marker function
function addMarker(marker: MapMarker) {
	markers = [...markers, marker]
	// Get map instance and fly to location
	const map = mapComponent?.getMap()
	if (map) {
		mapComponent.flyToMarker(marker.lngLat)
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
	<!-- Added h-full to ensure the container has height -->
	<div slot="right" class="flex h-full w-1/2 overflow-hidden rounded-md border">
		<Map bind:this={mapComponent} markers={markers} />
	</div>
</SplitCanvas>

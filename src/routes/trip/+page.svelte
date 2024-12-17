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

// Define the marker type
interface Marker {
	lngLat: [number, number]
	label: string
}

let markers: Marker[] = []

// Use a callback prop instead of event handling
function handleAddMarker(marker: { lngLat: [number, number]; label: string }) {
	markers = [...markers, marker]
}
</script>

<SplitCanvas>
	<div slot="left" class="flex-1 rounded-md border p-4">
		<TextEditor />
	</div>
	<div slot="right" class="flex-1 rounded-md border">
		<MapLibre
			center={[108, 17]}
			zoom={5}
			class="map h-full"
			style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
		>
			<NavigationControl position="top-right" />
			<FullscreenControl position="top-right" />

			{#each markers as { lngLat, label }}
				<DefaultMarker lngLat={lngLat}>
					<Popup offset={[0, -10]}>
						<div class="text-lg font-bold">{label}</div>
					</Popup>
				</DefaultMarker>
			{/each}
		</MapLibre>
	</div>
</SplitCanvas>

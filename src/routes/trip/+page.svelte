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
	<div slot="left" class="flex w-1/2 overflow-hidden rounded-md border">
		<div class="flex w-full flex-col overflow-hidden">
			<div class="no-scrollbar h-full w-full overflow-y-auto">
				<div class="w-full p-4">
					<TextEditor />
				</div>
			</div>
		</div>
	</div>
	<div slot="right" class="flex w-1/2 overflow-hidden rounded-md border">
		<MapLibre
			center={[108, 17]}
			zoom={5}
			class="h-full w-full"
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

<!-- /src/routes/morse/+page.svelte -->
<script lang="ts">
import Decoder from '$lib/app/morse/components/Decoder.svelte'
import Encoder from '$lib/app/morse/components/Encoder.svelte'
import Canvas from '$lib/components/common/Canvas/Canvas.svelte'
import * as Tabs from '$lib/components/ui/tabs'
</script>

<Canvas>
	<Tabs.Root value="encode">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="encode">Encoder</Tabs.Trigger>
			<Tabs.Trigger value="decode">Decoder</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="encode">
			<Encoder />
		</Tabs.Content>

		<Tabs.Content value="decode">
			<Decoder />
		</Tabs.Content>
	</Tabs.Root>
</Canvas>

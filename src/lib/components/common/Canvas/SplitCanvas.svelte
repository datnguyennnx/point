<!-- SplitCanvas.svelte -->
<main class="flex min-h-screen w-full">
	<div class="flex flex-1">
		<div class="flex h-full w-full flex-row space-x-2 p-8">
			<slot name="left" class="flex-1" />
			<!-- Allow text editor to take full width -->
			<slot name="right" class="flex-1" />
			<!-- Allow map to take full width -->
		</div>
	</div>
</main>

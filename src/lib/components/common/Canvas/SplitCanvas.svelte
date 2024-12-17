<!-- SplitCanvas.svelte -->
<main class="flex h-screen w-full overflow-hidden">
	<div class="flex w-full">
		<div class="flex w-full flex-row space-x-2 p-8">
			<slot name="left" />
			<slot name="right" />
		</div>
	</div>
</main>

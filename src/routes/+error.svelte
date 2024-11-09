<script lang="ts">
import { page } from '$app/stores'
import Button from '$lib/components/ui/button/button.svelte'
</script>

<div class="flex min-h-screen w-full flex-col items-center justify-center space-y-4">
	<h1 class="text-3xl font-bold">
		{$page.status}: Nothing here ser 👀
	</h1>
	<Button href="/">Go back Home</Button>
</div>

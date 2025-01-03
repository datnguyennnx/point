<!-- src/routes/auth/callback/+page.svelte -->
<script lang="ts">
import { onMount } from 'svelte'
import { goto } from '$app/navigation'
import { auth } from '$lib/stores/auth.svelte'
import { page } from '$app/stores'
import LoadingDot from '$lib/components/common/LoadingDot.svelte'

onMount(async () => {
	await auth.initAuth()
	const returnUrl = $page.url.searchParams.get('next') ?? '/'
	goto(returnUrl)
})
</script>

<div class="flex h-screen w-full items-center justify-center">
	<LoadingDot />
</div>

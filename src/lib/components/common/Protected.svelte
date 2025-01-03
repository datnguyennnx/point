<!-- src/lib/components/common/Protected.svelte -->
<script lang="ts">
import { page } from '$app/stores'
import { goto } from '$app/navigation'
import LoadingDot from './LoadingDot.svelte'
import { auth } from '$lib/stores/auth.svelte'

let { children } = $props<{
	children: () => any
}>()

let isLoading = $state(true)
let checkingAuth = $state(true)

// Initialize auth once
auth.initAuth().then(() => {
	checkingAuth = false
})

// Watch for session changes
$effect(() => {
	// Don't redirect while still checking auth
	if (checkingAuth) return

	// If no session, redirect to login
	if (!auth.session && !$page.url.pathname.startsWith('/auth/login')) {
		const currentPath = $page.url.pathname
		goto(`/auth/login?returnUrl=${currentPath}`)
		return
	}

	isLoading = false
})
</script>

{#if isLoading || checkingAuth}
	<LoadingDot />
{:else if auth.session}
	{@render children()}
{/if}

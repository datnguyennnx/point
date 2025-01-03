<script lang="ts">
import '../app.css'
import { inject } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit'
import { ModeWatcher } from 'mode-watcher'
import { dev } from '$app/environment'
import { databaseManager } from '$lib/database'
import LoadingDot from '$lib/components/common/LoadingDot.svelte'
import { onMount } from 'svelte'
import { auth } from '$lib/stores/auth.svelte'

onMount(async () => {
	await auth.initAuth()
})

let { children } = $props()
let databaseInitialized = $state(false)

inject({ mode: dev ? 'development' : 'production' })
injectSpeedInsights()

// Initialize database on app startup
$effect(() => {
	async function initializeDatabase() {
		try {
			await databaseManager.initDatabase()
			databaseInitialized = true
		} catch (error) {
			console.error('Failed to initialize database:', error)
			databaseInitialized = false
		}
	}

	initializeDatabase()
})
</script>

<ModeWatcher defaultMode="light" />
<main>
	{#if databaseInitialized}
		{@render children()}
	{:else}
		<LoadingDot />
	{/if}
</main>

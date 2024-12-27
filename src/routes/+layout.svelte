<script lang="ts">
import '../app.css'
import { inject } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit'
import { ModeWatcher } from 'mode-watcher'
import { dev } from '$app/environment'
import LoadingDot from '$lib/components/common/LoadingDot.svelte'
import AppSidebar from '$lib/components/common/Siderbar/AppSidebar.svelte'
import { SidebarProvider, SidebarTrigger } from '$lib/components/ui/sidebar/index.js'
import { databaseManager } from '$lib/database'

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
		<SidebarProvider>
			<AppSidebar />
			<SidebarTrigger />
			{@render children()}
		</SidebarProvider>
	{:else}
		<LoadingDot />
	{/if}
</main>

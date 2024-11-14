<script lang="ts">
import '../app.css'
import { dev } from '$app/environment'
import { inject } from '@vercel/analytics'
import { ModeWatcher } from 'mode-watcher'
import { SidebarProvider, SidebarTrigger } from '$lib/components/ui/sidebar/index.js'
import AppSidebar from '$lib/components/common/Siderbar/AppSidebar.svelte'
import LoadingDot from '$lib/components/common/LoadingDot.svelte'
import { databaseManager } from '$lib/database'

let { children } = $props()
let databaseInitialized = $state(false)

inject({ mode: dev ? 'development' : 'production' })

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

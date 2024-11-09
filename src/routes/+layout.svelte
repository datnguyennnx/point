<script lang="ts">
import '../app.css'
import { dev } from '$app/environment'
import { inject } from '@vercel/analytics'
import { ModeWatcher } from 'mode-watcher'
import { SidebarProvider, SidebarTrigger } from '$lib/components/ui/sidebar/index.js'
import AppSidebar from '$lib/components/Siderbar/AppSidebar.svelte'
// Inject the Analytics functionality
inject({ mode: dev ? 'development' : 'production' })
</script>

<ModeWatcher defaultMode="light" />
<main>
	<SidebarProvider>
		<AppSidebar />
		<SidebarTrigger />
		<slot />
	</SidebarProvider>
</main>

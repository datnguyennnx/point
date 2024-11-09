<script lang="ts">
	import '../app.css'
	import { mode, ModeWatcher } from 'mode-watcher'
	import { SidebarProvider, SidebarTrigger } from '$lib/components/ui/sidebar/index.js'
	import AppSidebar from '$lib/components/Siderbar/AppSidebar.svelte'
</script>

<ModeWatcher defaultMode="light" />
<main>
	<SidebarProvider>
		<AppSidebar />
		<SidebarTrigger />
		<slot />
	</SidebarProvider>
</main>

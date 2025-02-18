<script lang="ts">
import AppSidebar from '$lib/components/common/Siderbar/AppSidebar.svelte'
import { SidebarProvider, SidebarTrigger } from '$lib/components/ui/sidebar'

let { children } = $props()
</script>

<main>
	<SidebarProvider>
		<AppSidebar />
		<SidebarTrigger />
		{@render children()}
	</SidebarProvider>
</main>

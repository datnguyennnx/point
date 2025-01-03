<script>
import Canvas from '$lib/components/common/Canvas/Canvas.svelte'
import AppSidebar from '$lib/components/common/Siderbar/AppSidebar.svelte'
import { SidebarProvider, SidebarTrigger } from '$lib/components/ui/sidebar'
</script>

<SidebarProvider>
	<AppSidebar />
	<SidebarTrigger />
	<Canvas>
		<h1 class="flex justify-center text-3xl font-bold">Hello there 👀</h1>
	</Canvas>
</SidebarProvider>

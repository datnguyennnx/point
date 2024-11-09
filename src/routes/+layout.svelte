<script lang="ts">
	import '../app.css'
	import { mode, ModeWatcher } from 'mode-watcher'
	import * as Sidebar from '$lib/components/ui/sidebar/index.js'
	import MainSidebar from '$lib/components/Siderbar/MainSidebar.svelte'
</script>

<ModeWatcher defaultMode="light" />
<main>
	<Sidebar.Provider>
		<div class="flex flex-grow">
			<MainSidebar />
			<slot />
		</div>
	</Sidebar.Provider>
</main>

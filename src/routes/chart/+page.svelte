<script lang="ts">
	import { Heading, P } from 'flowbite-svelte'
	import Sidebar from '$lib/components/layout/Sidebar/Sidebar.svelte'
	import BackgroundDot from '$lib/components/common/BackgroundDot/BackgroundDot.svelte'
</script>

<div class="flex flex-grow">
	<Sidebar />
	<BackgroundDot />
	<div class="flex w-full min-h-screen">
		<div class="flex flex-col w-full justify-center items-center space-y-8">
			<Heading tag="h2" class="text-center">Chart Tools</Heading>
			<div class="z-50 min-w-[60rem] min-h-[60rem] bg-white border rounded-lg">
				<div class="flex w-auto h-auto p-4"></div>
			</div>
			<P class="text-lg lg:text-xl sm:px-16 xl:px-48 dark:text-white text-gray-500 italic">
				Support any chart you can type
			</P>
		</div>
	</div>
</div>

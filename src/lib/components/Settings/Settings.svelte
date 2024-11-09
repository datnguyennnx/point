<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
	import { mode, setMode } from 'mode-watcher'
	import { Settings, Info, Underline } from 'lucide-svelte'

	let isOpen = false
	let activeSection = 'general'

	const sidebarItems = [
		{ id: 'general', label: 'General', icon: Settings },
		{ id: 'about', label: 'About', icon: Info },
	]
</script>

<Dialog.Root>
	<Dialog.Trigger class="flex w-full items-start">Settings</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[900px] p-0 gap-0">
		<div class="flex h-[600px]">
			<!-- Sidebar -->
			<div class="w-[200px] border-r border-border bg-muted/40">
				<nav class="p-2">
					{#each sidebarItems as item}
						<button
							class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors
					{activeSection === item.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}"
							on:click={() => (activeSection = item.id)}
						>
							<svelte:component this={item.icon} class="w-4 h-4" />
							{item.label}
						</button>
					{/each}
				</nav>
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto">
				{#if activeSection === 'general'}
					<div class="p-6">
						<h3 class="text-lg font-medium mb-4">General Settings</h3>
						<div class="space-y-4">
							<!-- Theme Dropdown -->
							<div class="flex justify-between items-center">
								<span class="text-sm">Theme</span>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger
										class="inline-flex h-9 w-[180px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
									>
										{#if $mode === undefined}
											System
										{:else if $mode === 'light'}
											Light
										{:else if $mode === 'dark'}
											Dark
										{/if}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content>
										<DropdownMenu.Group>
											<DropdownMenu.Item>
												<button
													class="w-full flex justify-start"
													on:click={() => setMode('system')}
												>
													System</button
												>
											</DropdownMenu.Item>
											<DropdownMenu.Item>
												<button class="w-full flex justify-start" on:click={() => setMode('light')}>
													Light</button
												>
											</DropdownMenu.Item>
											<DropdownMenu.Item>
												<button class="w-full flex justify-start" on:click={() => setMode('dark')}>
													Dark</button
												>
											</DropdownMenu.Item>
										</DropdownMenu.Group>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>

							<!-- Language Dropdown -->
							<div class="flex justify-between items-center">
								<span class="text-sm">Language</span>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger
										class="inline-flex h-9 w-[180px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
									>
										English (US)
									</DropdownMenu.Trigger>
									<DropdownMenu.Content>
										<DropdownMenu.Group>
											<DropdownMenu.Item>English (US)</DropdownMenu.Item>
											<DropdownMenu.Item>Spanish</DropdownMenu.Item>
											<DropdownMenu.Item>French</DropdownMenu.Item>
										</DropdownMenu.Group>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>
						</div>
					</div>
				{:else if activeSection === 'about'}
					<div class="p-6">
						<h3 class="text-lg font-medium mb-4">About</h3>
						<div class="space-y-4 text-sm">
							<p>Version: 1.0.0</p>
							<p>Build: 2024.11.09</p>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<script lang="ts">
	import { ChartLine, ChevronUp, Binary } from 'lucide-svelte'
	import Settings from '$lib/components/Settings/Settings.svelte'
	import * as Sidebar from '$lib/components/ui/sidebar/index.js'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
	import * as Avatar from '$lib/components/ui/avatar/index.js'

	// Menu items.
	const items = [
		{
			title: 'Charts',
			url: '/charts',
			icon: ChartLine,
		},
		{
			title: 'Morse',
			url: '/morse',
			icon: Binary,
		},
	]
	const user = {
		name: 'test',
		email: 'hello@gmail.com',
	}
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton
								{...props}
								class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Avatar.Avatar class="h-6 w-6 rounded-lg">
									<Avatar.AvatarImage
										src={'https://avatar.iran.liara.run/public'}
										alt={user.name}
									/>
									<Avatar.AvatarFallback class="rounded-lg">CN</Avatar.AvatarFallback>
								</Avatar.Avatar>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate text-xs">{user.email}</span>
								</div>
								<ChevronUp class="ml-auto" />
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content side="top" class="w-[--bits-dropdown-menu-anchor-width]">
						<DropdownMenu.Item>
							<Settings />
						</DropdownMenu.Item>
						<DropdownMenu.Item>
							<span>Sign out</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>

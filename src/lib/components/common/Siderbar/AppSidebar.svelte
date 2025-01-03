<!-- src/lib/components/common/Siderbar/AppSidebar.svelte -->
<script lang="ts">
import { ChevronUp, Binary, ListChecks, MapPinned, LogOut, Settings } from 'lucide-svelte'
import SettingsForm from '$lib/components/common/Settings/Settings.svelte'
import * as Sidebar from '$lib/components/ui/sidebar/index.js'
import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
import * as Avatar from '$lib/components/ui/avatar/index.js'
import { goto } from '$app/navigation'
import { auth } from '$lib/stores/auth.svelte'
import { onMount } from 'svelte'

interface MenuItem {
	title: string
	url: string
	icon: any
}

// State
let isSigningOut = $state(false)
let avatarUrl = $state('https://avatar.iran.liara.run/public')

// Menu items
const items: MenuItem[] = [
	{
		title: 'Morse',
		url: '/morse',
		icon: Binary,
	},
	{
		title: 'Todos',
		url: '/todos',
		icon: ListChecks,
	},
	{
		title: 'Trip point',
		url: '/trip',
		icon: MapPinned,
	},
]

// Initialize auth once on mount
onMount(() => {
	auth.initAuth()
})

// Derived values from auth store
let userInitial = $derived(auth.user?.email?.[0]?.toUpperCase() ?? 'U')
let displayName = $derived(auth.user?.email ?? auth.user?.user_metadata?.name ?? 'user@gmail.com')

// Update avatar URL when user changes
$effect(() => {
	avatarUrl = auth.user?.user_metadata?.avatar_url ?? 'https://avatar.iran.liara.run/public'
})

async function handleSignOut() {
	try {
		isSigningOut = true
		const { error } = await auth.signOut()
		if (error) throw error
		goto('/auth/login')
	} catch (error) {
		console.error('Error signing out:', error)
	} finally {
		isSigningOut = false
	}
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

	{#if auth.isAuthenticated}
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
										<Avatar.AvatarImage src={avatarUrl} alt={displayName} />
										<Avatar.AvatarFallback class="rounded-lg">
											{userInitial}
										</Avatar.AvatarFallback>
									</Avatar.Avatar>
									<div class="grid flex-1 text-left text-sm leading-tight">
										<span class="truncate text-xs">
											{displayName}
										</span>
									</div>
									<ChevronUp class="ml-auto" />
								</Sidebar.MenuButton>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content side="top" class="w-[--bits-dropdown-menu-anchor-width]">
							<DropdownMenu.Item>
								<Settings class="mr-2 h-4 w-4" />
								<SettingsForm />
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onclick={handleSignOut}
								disabled={isSigningOut}
								class="text-destructive focus:text-destructive"
							>
								{#if isSigningOut}
									<div class="mr-2 h-4 w-4 animate-spin"></div>
								{:else}
									<LogOut class="mr-2 h-4 w-4" />
								{/if}
								<span>Sign out</span>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Footer>
	{/if}
</Sidebar.Root>

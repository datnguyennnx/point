<script>
	import {
		Sidebar,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper,
		SidebarBrand,
		SidebarDropdownItem,
		SidebarDropdownWrapper,
	} from 'flowbite-svelte'
	import {
		ChartPieSolid,
		GridSolid,
		MailBoxSolid,
		UserSolid,
		ArrowRightToBracketOutline,
		ChevronDoubleUpOutline,
		ChevronDoubleDownOutline,
		UserAddSolid,
	} from 'flowbite-svelte-icons'

	let spanClass = 'flex-1 ms-3 whitespace-nowrap'

	let site = {
		name: 'Toolkits',
		href: '/',
		img: ' /capybara.svg',
	}
</script>

<Sidebar>
	<SidebarWrapper class="border bg-white">
		<SidebarGroup class="flex flex-col min-h-screen">
			<SidebarBrand {site} />
			<SidebarDropdownWrapper>
				<svelte:fragment slot="icon">
					<UserAddSolid
						class="w-6 h-6 text-black transition duration-75 dark:text-white group-hover:text-black dark:group-hover:text-white"
					/>
					<p class="truncate mx-3">abcxyz@gmail.com</p>
				</svelte:fragment>
				<svelte:fragment slot="arrowup">
					<ChevronDoubleUpOutline class="w-6 h-6" />
				</svelte:fragment>
				<svelte:fragment slot="arrowdown">
					<ChevronDoubleDownOutline class="w-6 h-6" />
				</svelte:fragment>
				<SidebarDropdownItem label="Settings" />
				<SidebarDropdownItem label="Logout" />
			</SidebarDropdownWrapper>

			<SidebarItem label="Chart" href="/chart">
				<svelte:fragment slot="icon">
					<ChartPieSolid
						class="w-6 h-6 text-black transition duration-75 dark:text-white group-hover:text-black dark:group-hover:text-white"
					/>
				</svelte:fragment>
			</SidebarItem>
		</SidebarGroup>
	</SidebarWrapper>
</Sidebar>

<!-- src/routes/auth/login/+page.svelte -->
<script lang="ts">
import { page } from '$app/stores'
import { goto } from '$app/navigation'
import { auth } from '$lib/stores/auth.svelte'
import Canvas from '$lib/components/common/Canvas/Canvas.svelte'
import UserAuthForm from '$lib/components/common/user-auth-form.svelte'
import LoadingDot from '$lib/components/common/LoadingDot.svelte'

const returnUrl = $derived($page.url.searchParams.get('returnUrl') ?? '/')
let checkingAuth = $state(true)

// Check auth state once
auth.initAuth().then(() => {
	checkingAuth = false
})

// Handle session state
$effect(() => {
	if (checkingAuth) return

	if (auth.session) {
		goto(returnUrl)
	}
})
</script>

{#if checkingAuth}
	<LoadingDot />
{:else}
	<Canvas>
		<div class="mt-[-8rem] flex h-full w-full flex-col items-center space-y-8">
			<h1 class="text-xl font-bold">Login to Point</h1>
			<UserAuthForm returnUrl={returnUrl} />
		</div>
	</Canvas>
{/if}

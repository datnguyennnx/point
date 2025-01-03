<!-- src/lib/components/common/user-auth-form.svelte -->
<script lang="ts">
import { LoaderCircle, Github } from 'lucide-svelte'
import { Button } from '$lib/components/ui/button/index.js'
import { cn } from '$lib/utils.js'
import { supabase } from '$lib/supabase'

let { returnUrl } = $props()
let isLoading = $state(false)
let error = $state<string | null>(null)

async function handleGitHubLogin() {
	try {
		isLoading = true
		error = null

		const { error: authError } = await supabase.auth.signInWithOAuth({
			provider: 'github',
			options: {
				redirectTo: `${window.location.origin}/auth/callback?next=${returnUrl}`,
				// Optional: Specify which scopes you need
				scopes: 'read:user user:email',
			},
		})

		if (authError) {
			error = authError.message
		}
	} catch (e) {
		error = 'An unexpected error occurred'
		console.error('Login error:', e)
	} finally {
		isLoading = false
	}
}
</script>

<div class={cn('grid w-[80%] gap-6')}>
	{#if error}
		<div class="text-sm text-destructive">{error}</div>
	{/if}

	<Button variant="outline" type="button" disabled={isLoading} onclick={handleGitHubLogin}>
		{#if isLoading}
			<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
		{:else}
			<Github class="mr-2 h-4 w-4" />
		{/if}
		Continue with GitHub
	</Button>
</div>

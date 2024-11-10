<script lang="ts">
import { Button } from '$lib/components/ui/button'
import { db } from '$lib/database'
import { liveQuery } from 'dexie'

export let filter: 'all' | 'active' | 'completed' = 'all'

// Get stats for the filter buttons
const stats = liveQuery(async () => {
	const allTodos = await db.getTodos()
	return {
		total: allTodos.length,
		completed: allTodos.filter((t) => t.completed).length,
		active: allTodos.filter((t) => !t.completed).length,
	}
})
</script>

<div class="flex space-x-2">
	{#if $stats}
		<Button
			variant={filter === 'all' ? 'default' : 'outline'}
			size="sm"
			onclick={() => (filter = 'all')}
		>
			All ({$stats.total})
		</Button>
		<Button
			variant={filter === 'active' ? 'default' : 'outline'}
			size="sm"
			onclick={() => (filter = 'active')}
		>
			Active ({$stats.active})
		</Button>
		<Button
			variant={filter === 'completed' ? 'default' : 'outline'}
			size="sm"
			onclick={() => (filter = 'completed')}
		>
			Completed ({$stats.completed})
		</Button>
	{/if}
</div>

<script lang="ts">
import { Button } from '$lib/components/ui/button'
import { tododb } from '$lib/database'

// Define props with explicit type
const props = $props<{
	filter: 'all' | 'active' | 'completed'
	onFilterChange: (newFilter: 'all' | 'active' | 'completed') => void
}>()

// Reactive stats state
let stats = $state({
	total: 0,
	completed: 0,
	active: 0,
})

// Function to fetch stats
async function fetchStats() {
	try {
		const todoStats = await tododb.getTodoStats()
		stats = {
			total: todoStats.total,
			completed: todoStats.completed,
			active: todoStats.active,
		}
	} catch (error) {
		console.error('Failed to fetch todo stats:', error)
	}
}

// Function to handle filter change
function handleFilterChange(newFilter: 'all' | 'active' | 'completed') {
	console.log('Filter change in TodoFilter:', newFilter)
	props.onFilterChange(newFilter)
}

// Initial fetch
fetchStats()

// Reactive fetch when todos change
$effect(() => {
	const unsubscribe = tododb.onChange(() => {
		fetchStats()
	})

	return () => {
		unsubscribe()
	}
})
</script>

<div class="flex space-x-2">
	<Button
		variant={props.filter === 'all' ? 'default' : 'outline'}
		size="sm"
		onclick={() => handleFilterChange('all')}
	>
		All ({stats.total})
	</Button>
	<Button
		variant={props.filter === 'active' ? 'default' : 'outline'}
		size="sm"
		onclick={() => handleFilterChange('active')}
	>
		Active ({stats.active})
	</Button>
	<Button
		variant={props.filter === 'completed' ? 'default' : 'outline'}
		size="sm"
		onclick={() => handleFilterChange('completed')}
	>
		Completed ({stats.completed})
	</Button>
</div>

<script lang="ts">
import { Button } from '$lib/components/ui/button'
import { tododb } from '$lib/database/todo-db'

// Props with $props
let { filter, onFilterChange } = $props<{
	filter: 'all' | 'active' | 'completed'
	onFilterChange: (newFilter: 'all' | 'active' | 'completed') => void
}>()

// Reactive stats using $state
let stats = $state({
	total: 0,
	completed: 0,
	active: 0,
})

// Derived stats
let statsDisplay = $derived({
	all: `(${stats.total})`,
	active: `(${stats.active})`,
	completed: `(${stats.completed})`,
})

// Effect for fetching stats
$effect(() => {
	async function updateStats() {
		try {
			stats = await tododb.getTodoStats()
		} catch (error) {
			console.error('Failed to fetch todo stats:', error)
		}
	}

	updateStats()

	const unsubscribe = tododb.onChange(updateStats)
	return () => unsubscribe()
})
</script>

<div class="flex space-x-2">
	<Button
		variant={filter === 'all' ? 'default' : 'outline'}
		size="sm"
		onclick={() => onFilterChange('all')}
	>
		All {statsDisplay.all}
	</Button>
	<Button
		variant={filter === 'active' ? 'default' : 'outline'}
		size="sm"
		onclick={() => onFilterChange('active')}
	>
		Active {statsDisplay.active}
	</Button>
	<Button
		variant={filter === 'completed' ? 'default' : 'outline'}
		size="sm"
		onclick={() => onFilterChange('completed')}
	>
		Completed {statsDisplay.completed}
	</Button>
</div>

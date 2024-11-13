<script lang="ts">
import * as Card from '$lib/components/ui/card'
import Canvas from '$lib/components/common/Canvas/Canvas.svelte'
import { tododb } from '$lib/database'
import TodoInput from '$lib/components/todos/TodoInput.svelte'
import TodoFilter from '$lib/components/todos/TodoFilter.svelte'
import TodoList from '$lib/components/todos/TodoList.svelte'

// Centralized filter state
let filter = $state<'all' | 'active' | 'completed'>('all')

// Function to handle filter change
function handleFilterChange(newFilter: 'all' | 'active' | 'completed') {
	console.log('Parent component filter change:', newFilter)
	filter = newFilter
}

// Use $state for stats
let stats = $state({
	total: 0,
	completed: 0,
})

// Function to fetch stats
async function fetchStats() {
	try {
		const todoStats = await tododb.getTodoStats()
		stats = {
			total: todoStats.total,
			completed: todoStats.completed,
		}
	} catch (error) {
		console.error('Failed to fetch todo stats:', error)
	}
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

<Canvas>
	<Card.Root>
		<Card.Header>
			<Card.Title>Todo List</Card.Title>
			<Card.Description>Your todos are automatically saved</Card.Description>
		</Card.Header>

		<Card.Content class="space-y-4">
			<TodoInput />
			<TodoFilter filter={filter} onFilterChange={handleFilterChange} />
			<TodoList filter={filter} />
		</Card.Content>

		<Card.Footer>
			<div class="text-sm text-muted-foreground">
				{stats.completed} of {stats.total} items completed
			</div>
		</Card.Footer>
	</Card.Root>
</Canvas>

<script lang="ts">
import * as Card from '$lib/components/ui/card'
import Canvas from '$lib/components/common/Canvas/Canvas.svelte'
import { tododb } from '$lib/database'
import { databaseManager } from '$lib/database'
import TodoInput from '$lib/components/todos/TodoInput.svelte'
import TodoFilter from '$lib/components/todos/TodoFilter.svelte'
import TodoList from '$lib/components/todos/TodoList.svelte'
import LoadingDot from '$lib/components/common/LoadingDot.svelte'

// Centralized filter state
let filter = $state<'all' | 'active' | 'completed'>('all')
let databaseReady = $state(false)

// Use $state for stats
let stats = $state({
	total: 0,
	completed: 0,
})

// Initialize database and set ready state
async function initializeDatabase() {
	try {
		await databaseManager.initDatabase()
		databaseReady = true
		fetchStats()
	} catch (error) {
		console.error('Failed to initialize database:', error)
		databaseReady = false
	}
}

// Initial database initialization
initializeDatabase()

// Function to handle filter change
function handleFilterChange(newFilter: 'all' | 'active' | 'completed') {
	if (!databaseReady) return
	console.log('Parent component filter change:', newFilter)
	filter = newFilter
}

// Function to fetch stats
async function fetchStats() {
	if (!databaseReady) return

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

// Reactive fetch when todos change
$effect(() => {
	if (!databaseReady) return

	const unsubscribe = tododb.onChange(() => {
		fetchStats()
	})

	return () => {
		unsubscribe()
	}
})
</script>

<Canvas>
	{#if !databaseReady}
		<LoadingDot />
	{:else}
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
	{/if}
</Canvas>

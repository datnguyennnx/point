<script lang="ts">
import { tododb } from '$lib/database/todo-db'
import TodoItem from './TodoItem.svelte'
import type { Todo } from '$lib/database/todo-db'

// Props with $props
let { filter } = $props<{
	filter: 'all' | 'active' | 'completed'
}>()

// Reactive todos state
let todos = $state<Todo[]>([])

// Derived filtered todos
let filteredTodos = $derived(
	filter === 'all' ? todos : todos.filter((todo) => todo.completed === (filter === 'completed')),
)

// Function to fetch todos
async function fetchTodos() {
	try {
		todos = await tododb.getFilteredTodos(filter)
	} catch (error) {
		console.error('Failed to fetch todos:', error)
		todos = []
	}
}

// Derived empty state message
let emptyStateMessage = $derived(
	filter === 'all'
		? 'No todos yet'
		: filter === 'active'
			? 'No active todos'
			: 'No completed todos',
)

// Effect for initial load and database changes
$effect(() => {
	fetchTodos()
	const unsubscribe = tododb.onChange(fetchTodos)
	return () => unsubscribe()
})

// Handler functions for TodoItem
async function handleToggle(id: number) {
	await tododb.toggleTodo(id)
}

async function handleDelete(id: number) {
	await tododb.deleteTodo(id)
}
</script>

<div class="space-y-2">
	{#if filteredTodos.length === 0}
		<div class="py-4 text-center text-muted-foreground">
			{emptyStateMessage}
		</div>
	{:else}
		{#each filteredTodos as todo (todo.id)}
			<TodoItem todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
		{/each}
	{/if}
</div>

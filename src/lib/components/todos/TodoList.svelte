<script lang="ts">
import { tododb } from '$lib/database/todo-db'
import TodoItem from './TodoItem.svelte'
import type { Todo } from '$lib/database/todo-db'

// Define props with explicit type
const props = $props<{
	filter: 'all' | 'active' | 'completed'
}>()

// Reactive todos state
let todos = $state<Todo[]>([])

// Function to fetch todos
async function fetchTodos() {
	try {
		console.log('Fetching todos with filter:', props.filter)
		todos = await tododb.getFilteredTodos(props.filter)
		console.log('Fetched todos:', todos)
	} catch (error) {
		console.error('Failed to fetch todos:', error)
	}
}

// Initial fetch
fetchTodos()

// Reactive fetch when filter or todos change
$effect(() => {
	const unsubscribe = tododb.onChange(() => {
		fetchTodos()
	})

	return () => {
		unsubscribe()
	}
})

// Reactive effect to log filter changes
$effect(() => {
	console.log('Filter changed to:', props.filter)
	fetchTodos()
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
	{#if todos.length === 0}
		<div class="py-4 text-center text-muted-foreground">
			No {props.filter} todos to show.
		</div>
	{:else}
		{#each todos as todo (todo.id)}
			<TodoItem todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
		{/each}
	{/if}
</div>

<script lang="ts">
import { liveQuery } from 'dexie'
import { tododb } from '$lib/database'
import TodoItem from './TodoItem.svelte'

export let filter: 'all' | 'active' | 'completed' = 'all'

// Live query todos based on filter
$: todos = liveQuery(() => tododb.getFilteredTodos(filter))

// Handler functions for TodoItem
async function handleToggle(id: number) {
	await tododb.toggleTodo(id)
}

async function handleDelete(id: number) {
	await tododb.deleteTodo(id)
}
</script>

<div class="space-y-2">
	{#if $todos}
		{#if $todos.length === 0}
			<div class="py-4 text-center text-muted-foreground">
				No {filter} todos to show.
			</div>
		{:else}
			{#each $todos as todo (todo.id)}
				<TodoItem todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
			{/each}
		{/if}
	{/if}
</div>

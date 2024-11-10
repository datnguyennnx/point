<script lang="ts">
import * as Card from '$lib/components/ui/card'
import Canvas from '$lib/components/common/Canvas/Canvas.svelte'
import { liveQuery } from 'dexie'
import { tododb } from '$lib/database'
import TodoInput from '$lib/components/todos/TodoInput.svelte'
import TodoFilter from '$lib/components/todos/TodoFilter.svelte'
import TodoList from '$lib/components/todos/TodoList.svelte'

let filter = $state<'all' | 'active' | 'completed'>('all')

// Stats for the footer
const stats = liveQuery(async () => {
	const allTodos = await tododb.getTodos()
	return {
		total: allTodos.length,
		completed: allTodos.filter((t) => t.completed).length,
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
			<TodoFilter bind:filter={filter} />
			<TodoList filter={filter} />
		</Card.Content>

		<Card.Footer>
			{#if $stats}
				<div class="text-sm text-muted-foreground">
					{$stats.completed} of {$stats.total} items completed
				</div>
			{/if}
		</Card.Footer>
	</Card.Root>
</Canvas>

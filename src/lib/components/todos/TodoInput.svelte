<script lang="ts">
import { Input } from '$lib/components/ui/input'
import { Button } from '$lib/components/ui/button'
import { tododb } from '$lib/database/todo-db'

// Use $state for todo input text and description
let newTodoText = $state('')
let newTodoDescription = $state('')
let error = $state('')

// Function to add a new todo
async function addTodo() {
	const trimmedText = newTodoText.trim()
	const trimmedDescription = newTodoDescription.trim()

	if (!trimmedText) {
		error = 'Todo text cannot be empty'
		return
	}

	try {
		await tododb.addTodo(trimmedText, trimmedDescription || undefined)

		// Reset inputs
		newTodoText = ''
		newTodoDescription = ''
	} catch (error) {
		console.error('Failed to add todo:', error)
	}
}

// Handle key press event for Enter key
function handleKeyPress(event: KeyboardEvent) {
	if (event.key === 'Enter') {
		addTodo()
	}
}
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<label for="todoText" class="block text-sm font-medium text-gray-700">Todo Text</label>
		<Input
			id="todoText"
			type="text"
			placeholder="Add a new todo..."
			bind:value={newTodoText}
			onkeypress={handleKeyPress}
			required
		/>
	</div>

	<div class="space-y-2">
		<label for="todoDescription" class="block text-sm font-medium text-gray-700"
			>Description (Optional)</label
		>
		<Input
			id="todoDescription"
			type="text"
			placeholder="Add a description..."
			bind:value={newTodoDescription}
			onkeypress={handleKeyPress}
		/>
	</div>

	{#if error}
		<p class="text-red-500">{error}</p>
	{/if}

	<Button variant="default" onclick={addTodo} disabled={!newTodoText.trim()} class="w-full">
		Add Todo
	</Button>
</div>

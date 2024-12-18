<script lang="ts">
import { Input } from '$lib/components/ui/input'
import { Button } from '$lib/components/ui/button'
import { tododb } from '$lib/database/todo-db'

// Reactive state with $state
let newTodoText = $state('')
let newTodoDescription = $state('')
let error = $state('')

// Derived validation state
let isValidTodo = $derived(newTodoText.trim().length > 0)
let remainingTextChars = $derived(100 - newTodoText.length)
let remainingDescChars = $derived(500 - newTodoDescription.length)

// Function to add a new todo
async function addTodo() {
	const trimmedText = newTodoText.trim()
	const trimmedDescription = newTodoDescription.trim()

	if (!isValidTodo) {
		error = 'Todo text cannot be empty'
		return
	}

	try {
		await tododb.addTodo(trimmedText, trimmedDescription || undefined)
		resetForm()
	} catch (error) {
		console.error('Failed to add todo:', error)
	}
}

// Reset form function
function resetForm() {
	newTodoText = ''
	newTodoDescription = ''
	error = ''
}

// Handle key press event for Enter key
function handleKeyPress(event: KeyboardEvent) {
	if (event.key === 'Enter' && isValidTodo) {
		addTodo()
	}
}
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<label for="todoText" class="block text-sm font-medium text-gray-700">
			Todo Text
			<span class="ml-2 text-xs text-gray-500">({remainingTextChars} chars left)</span>
		</label>
		<Input
			id="todoText"
			type="text"
			placeholder="Add a new todo..."
			bind:value={newTodoText}
			maxlength={100}
			onkeypress={handleKeyPress}
			required
			class={remainingTextChars < 10 ? 'border-yellow-500' : ''}
		/>
	</div>

	<div class="space-y-2">
		<label for="todoDescription" class="block text-sm font-medium text-gray-700">
			Description (Optional)
			<span class="ml-2 text-xs text-gray-500">({remainingDescChars} chars left)</span>
		</label>
		<Input
			id="todoDescription"
			type="text"
			placeholder="Add a description..."
			bind:value={newTodoDescription}
			maxlength={500}
			onkeypress={handleKeyPress}
			class={remainingDescChars < 50 ? 'border-yellow-500' : ''}
		/>
	</div>

	{#if error}
		<p class="text-red-500">{error}</p>
	{/if}

	<Button variant="default" onclick={addTodo} disabled={!isValidTodo} class="w-full">
		Add Todo
	</Button>
</div>

<script lang="ts">
import { Input } from '$lib/components/ui/input'
import { Button } from '$lib/components/ui/button'
import { tododb } from '$lib/database'

// Use $state for todo input text
let newTodoText = $state('')

// Function to add a new todo
async function addTodo() {
	const trimmedText = newTodoText.trim()
	if (trimmedText) {
		try {
			await tododb.addTodo(trimmedText)
			// Clear input after successful addition
			newTodoText = ''
		} catch (error) {
			console.error('Failed to add todo:', error)
			// Optionally, you could add error handling UI here
		}
	}
}

// Handle key press event for Enter key
function handleKeyPress(event: KeyboardEvent) {
	if (event.key === 'Enter') {
		addTodo()
	}
}
</script>

<div class="flex space-x-2">
	<div class="flex-1">
		<Input
			type="text"
			placeholder="Add a new todo..."
			bind:value={newTodoText}
			onkeypress={handleKeyPress}
		/>
	</div>
	<Button variant="default" onclick={addTodo} disabled={!newTodoText.trim()}>Add Todo</Button>
</div>

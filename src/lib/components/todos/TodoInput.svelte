<script lang="ts">
import { Input } from '$lib/components/ui/input'
import { Button } from '$lib/components/ui/button'
import { db } from '$lib/database'

let newTodoText = $state('')

async function addTodo() {
	if (newTodoText.trim()) {
		try {
			await db.addTodo(newTodoText)
			newTodoText = ''
		} catch (error) {
			console.error('Failed to add todo:', error)
		}
	}
}

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

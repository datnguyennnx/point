<script lang="ts">
import { Button } from '$lib/components/ui/button'
import { CheckIcon, TrashIcon } from 'lucide-svelte'
import type { Todo } from '$lib/database/todo-db'
import { formatDate } from '$lib/utils/date'

// Define props with explicit type
const props = $props<{
	todo: Todo
	onToggle: (id: number) => Promise<void>
	onDelete: (id: number) => Promise<void>
}>()

// Handle todo toggle
async function handleToggle() {
	if (props.todo.id) {
		try {
			await props.onToggle(props.todo.id)
		} catch (error) {
			console.error('Failed to toggle todo:', error)
		}
	}
}

// Handle todo deletion
async function handleDelete() {
	if (props.todo.id) {
		try {
			await props.onDelete(props.todo.id)
		} catch (error) {
			console.error('Failed to delete todo:', error)
		}
	}
}
</script>

<div class="flex items-center justify-between rounded-md border bg-card p-3">
	<div class="flex items-center space-x-2">
		<Button variant="ghost" size="icon" onclick={handleToggle}>
			<CheckIcon class={props.todo.completed ? 'text-green-500' : 'text-muted-foreground'} />
		</Button>
		<div class="flex flex-col">
			<p
				class={props.todo.completed
					? 'text-muted-foreground line-through'
					: 'overflow-hidden text-ellipsis'}
			>
				{props.todo.text}
			</p>
			<p class="text-xs text-muted-foreground">
				{formatDate(props.todo.createdAt)}
			</p>
		</div>
	</div>
	<Button variant="ghost" size="icon" onclick={handleDelete}>
		<TrashIcon class="text-destructive" />
	</Button>
</div>

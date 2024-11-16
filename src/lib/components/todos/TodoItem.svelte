<script lang="ts">
import { Button } from '$lib/components/ui/button'
import { CheckIcon, TrashIcon } from 'lucide-svelte'
import type { Todo } from '$lib/database/todo-db'
import { formatDate } from '$lib/utils/date'

// Props with $props
let { todo, onToggle, onDelete } = $props<{
	todo: Todo
	onToggle: (id: number) => Promise<void>
	onDelete: (id: number) => Promise<void>
}>()

// Derived display properties
let displayProps = $derived({
	checkIconClass: todo.completed ? 'text-green-500' : 'text-muted-foreground',
	textClass: todo.completed ? 'text-muted-foreground line-through truncate' : 'truncate',
})

// Handle todo toggle with error handling
async function handleToggle() {
	if (todo.id) {
		try {
			await onToggle(todo.id)
		} catch (error) {
			console.error('Failed to toggle todo:', error)
		}
	}
}

// Handle todo deletion with error handling
async function handleDelete() {
	if (todo.id) {
		try {
			await onDelete(todo.id)
		} catch (error) {
			console.error('Failed to delete todo:', error)
		}
	}
}

// Derived formatted date
let formattedDate = $derived(formatDate(todo.createdAt))
</script>

<div class="flex items-center justify-between rounded-md border p-3">
	<div class="flex min-w-0 flex-1 items-center space-x-2">
		<Button variant="ghost" size="icon" onclick={handleToggle}>
			<CheckIcon class={displayProps.checkIconClass} />
		</Button>
		<div class="flex min-w-0 flex-1 flex-col">
			<p class={`${displayProps.textClass} w-full min-w-0`}>
				{todo.text}
			</p>
			<p class="w-full min-w-0 truncate text-xs text-muted-foreground">
				{formattedDate}
			</p>
		</div>
	</div>
	<Button variant="ghost" size="icon" onclick={handleDelete}>
		<TrashIcon class="text-destructive" />
	</Button>
</div>

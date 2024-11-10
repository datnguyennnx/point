<script lang="ts">
import { Button } from '$lib/components/ui/button'
import { CheckIcon, TrashIcon } from 'lucide-svelte'
import type { Todo } from '$lib/database'
import { formatDate } from '$lib/utils/date'

export let todo: Todo
export let onToggle: (id: number) => Promise<void>
export let onDelete: (id: number) => Promise<void>

const handleToggle = async () => {
	if (todo.id) {
		try {
			await onToggle(todo.id)
		} catch (error) {
			console.error('Failed to toggle todo:', error)
		}
	}
}

const handleDelete = async () => {
	if (todo.id) {
		try {
			await onDelete(todo.id)
		} catch (error) {
			console.error('Failed to delete todo:', error)
		}
	}
}
</script>

<div class="flex items-center justify-between rounded-md border bg-card p-3">
	<div class="flex items-center space-x-2">
		<Button variant="ghost" size="icon" onclick={handleToggle}>
			<CheckIcon class={todo.completed ? 'text-green-500' : 'text-muted-foreground'} />
		</Button>
		<div class="flex flex-col">
			<span class={todo.completed ? 'text-muted-foreground line-through' : ''}>
				{todo.text}
			</span>
			<span class="text-xs text-muted-foreground">
				{formatDate(todo.createdAt)}
			</span>
		</div>
	</div>
	<Button variant="ghost" size="icon" onclick={handleDelete}>
		<TrashIcon class="text-destructive" />
	</Button>
</div>

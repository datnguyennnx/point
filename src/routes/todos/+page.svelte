<script lang="ts">
import * as Card from '$lib/components/ui/card/index.js'
import { Input } from '$lib/components/ui/input/index.js'
import { Button } from '$lib/components/ui/button/index.js'
import { TrashIcon, CheckIcon } from 'lucide-svelte'
import Canvas from '$lib/components/common/Canvas/Canvas.svelte'

// Define Todo interface
interface Todo {
	id: number
	text: string
	completed: boolean
	createdAt: number
}

// State management using $state
let todos = $state<Todo[]>([])
let newTodoText = $state('')
let filter = $state<'all' | 'active' | 'completed'>('all')

// Derived state for filtered todos and statistics
let filteredTodos = $derived(
	filter === 'all'
		? todos
		: filter === 'active'
			? todos.filter((t) => !t.completed)
			: todos.filter((t) => t.completed),
)

let stats = $derived({
	total: todos.length,
	completed: todos.filter((t) => t.completed).length,
	active: todos.filter((t) => !t.completed).length,
})

// Effect for localStorage persistence
$effect(() => {
	if (typeof window !== 'undefined') {
		localStorage.setItem('todos', JSON.stringify($state.snapshot(todos)))
	}
})

// Initialize todos from localStorage
$effect(() => {
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem('todos')
		if (stored) {
			todos = JSON.parse(stored)
		}
	}
})

// Todo management functions
function addTodo() {
	if (newTodoText.trim()) {
		todos = [
			...todos,
			{
				id: Date.now(),
				text: newTodoText,
				completed: false,
				createdAt: Date.now(),
			},
		]
		newTodoText = ''
	}
}

function deleteTodo(id: number) {
	todos = todos.filter((todo) => todo.id !== id)
}

function toggleTodo(id: number) {
	todos = todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
}

function handleKeyPress(event: KeyboardEvent) {
	if (event.key === 'Enter') {
		addTodo()
	}
}

// Debug logging in development
$inspect(todos).with((value) => {
	if (import.meta.env.DEV) {
		console.log('Todos updated:', value)
	}
})
</script>

<Canvas>
	<Card.Root>
		<Card.Header>
			<Card.Title>Todo List</Card.Title>
			<Card.Description>Manage your daily tasks and stay organized</Card.Description>
		</Card.Header>

		<Card.Content class="space-y-4">
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

			<div class="flex space-x-2">
				<Button
					variant={filter === 'all' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (filter = 'all')}
				>
					All ({stats.total})
				</Button>
				<Button
					variant={filter === 'active' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (filter = 'active')}
				>
					Active ({stats.active})
				</Button>
				<Button
					variant={filter === 'completed' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (filter = 'completed')}
				>
					Completed ({stats.completed})
				</Button>
			</div>

			<div class="space-y-2">
				{#if filteredTodos.length === 0}
					<div class="py-4 text-center text-muted-foreground">
						{#if todos.length === 0}
							No todos yet. Add one above!
						{:else}
							No {filter} todos to show.
						{/if}
					</div>
				{:else}
					{#each filteredTodos as todo (todo.id)}
						<div class="flex items-center justify-between rounded-md border bg-card p-3">
							<div class="flex items-center space-x-2">
								<Button variant="ghost" size="icon" onclick={() => toggleTodo(todo.id)}>
									<CheckIcon class={todo.completed ? 'text-green-500' : 'text-muted-foreground'} />
								</Button>
								<div class="flex flex-col">
									<span class={todo.completed ? 'text-muted-foreground line-through' : ''}>
										{todo.text}
									</span>
									<span class="text-xs text-muted-foreground">
										{new Date(todo.createdAt).toLocaleDateString()}
									</span>
								</div>
							</div>
							<Button variant="ghost" size="icon" onclick={() => deleteTodo(todo.id)}>
								<TrashIcon class="text-destructive" />
							</Button>
						</div>
					{/each}
				{/if}
			</div>
		</Card.Content>

		<Card.Footer>
			<div class="text-sm text-muted-foreground">
				{stats.completed} of {stats.total} items completed
			</div>
		</Card.Footer>
	</Card.Root>
</Canvas>

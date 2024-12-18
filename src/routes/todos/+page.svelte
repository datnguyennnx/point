<script lang="ts">
import { page } from '$app/stores'
import { goto } from '$app/navigation'
import * as Card from '$lib/components/ui/card'
import * as Table from '$lib/components/ui/table/index.js'
import * as Dialog from '$lib/components/ui/dialog/index.js'
import { Badge } from '$lib/components/ui/badge/index.js'
import { Checkbox } from '$lib/components/ui/checkbox/index.js'
import { Button } from '$lib/components/ui/button/index.js'
import { Input } from '$lib/components/ui/input/index.js'
import { Plus, Expand, Edit } from 'lucide-svelte'
import { tododb } from '$lib/database/todo-db'
import type { Todo } from '$lib/database/todo-db'
import Canvas from '$lib/components/common/Canvas/Canvas.svelte'
import TableWrapper from '$lib/components/common/Canvas/TableWrapper.svelte'
import TodoInput from '$lib/app/todos/components/TodoInput.svelte'
import TodoFilter from '$lib/app/todos/components/TodoFilter.svelte'
import TodoList from '$lib/app/todos/components/TodoList.svelte'

// Centralized state management with Svelte 5 runes
let filter = $state<'all' | 'active' | 'completed'>('all')
let databaseReady = $state(false)
let todos = $state<Todo[]>([])
let isDialogOpen = $state(false)
let isEditDialogOpen = $state(false)

// State for editing a specific todo
let currentEditTodo = $state<Todo | null>(null)
let editDescription = $state('')

// Function to handle filter change
function handleFilterChange(newFilter: 'all' | 'active' | 'completed') {
	if (!databaseReady) return
	filter = newFilter
}

// Function to switch to table view
function switchToTableView() {
	goto('/todos?table')
}

// Derived stats using $derived
let stats = $derived({
	total: todos.length,
	completed: todos.filter((todo) => todo.completed).length,
})

// Effect for fetching todos and stats
$effect(() => {
	async function initializeTodos() {
		try {
			todos = await tododb.getTodos()
			databaseReady = true
		} catch (error) {
			console.error('Failed to initialize todos:', error)
			todos = []
			databaseReady = false
		}
	}

	initializeTodos()

	const unsubscribe = tododb.onChange(initializeTodos)
	return () => unsubscribe()
})

// Table-specific functions
async function toggleTodo(id: number) {
	await tododb.toggleTodo(id)
}

async function removeTodo(id: number) {
	await tododb.deleteTodo(id)
}

// Function to open edit dialog
function openEditDialog(todo: Todo) {
	currentEditTodo = todo
	editDescription = todo.description || ''
	isEditDialogOpen = true
}

// Function to update todo description
async function updateTodoDescription() {
	if (!currentEditTodo) return

	try {
		await tododb.updateTodoText(currentEditTodo.id!, currentEditTodo.text, editDescription)
		isEditDialogOpen = false
		currentEditTodo = null
	} catch (error) {
		console.error('Failed to update todo description:', error)
	}
}
</script>

{#if $page.url.pathname === '/todos' && !$page.url.searchParams.has('table')}
	<Canvas>
		<Card.Root>
			<Card.Header>
				<div class="flex items-center justify-between">
					<Card.Title>Todo List</Card.Title>
					<Button
						variant="outline"
						size="icon"
						onclick={switchToTableView}
						title="Switch to Table View"
					>
						<Expand class="h-4 w-4" />
					</Button>
				</div>
				<Card.Description>Your todos are automatically saved</Card.Description>
			</Card.Header>

			<Card.Content class="space-y-4">
				<TodoInput />
				<TodoFilter filter={filter} onFilterChange={handleFilterChange} />
				<TodoList filter={filter} />
			</Card.Content>

			<Card.Footer>
				<div class="text-sm text-muted-foreground">
					{stats.completed} of {stats.total} items completed
				</div>
			</Card.Footer>
		</Card.Root>
	</Canvas>
{:else if $page.url.pathname === '/todos' && $page.url.searchParams.has('table')}
	<TableWrapper>
		<Table.Root>
			<Table.Caption>A list of your todos.</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[50px]">Complete</Table.Head>
					<Table.Head>Task</Table.Head>
					<Table.Head>Description</Table.Head>
					<Table.Head class="text-right">Status</Table.Head>
					<Table.Head class="text-right">Created At</Table.Head>
					<Table.Head class="text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each todos as todo (todo.id)}
					<Table.Row>
						<Table.Cell>
							<Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id!)} />
						</Table.Cell>
						<Table.Cell class="max-w-[250px]">
							<p class="truncate">{todo.text}</p>
						</Table.Cell>
						<Table.Cell class="flex  max-w-[550px] flex-row items-center text-gray-500">
							<p class="mr-2 flex-1 truncate">{todo.description || '-'}</p>
							<Button
								variant="ghost"
								size="icon"
								class="shrink-0"
								onclick={() => openEditDialog(todo)}
							>
								<Edit class="h-4 w-4" />
							</Button>
						</Table.Cell>
						<Table.Cell class="text-right">
							<Badge variant={todo.completed ? 'success' : 'warning'}>
								{todo.completed ? 'Completed' : 'Pending'}
							</Badge>
						</Table.Cell>
						<Table.Cell class="max-w-[120px] text-right">
							<p class="truncate">{new Date(todo.createdAt).toLocaleString()}</p>
						</Table.Cell>
						<Table.Cell class="text-right">
							<Dialog.Root>
								<Dialog.Trigger class="rounded-md bg-red-500 p-2 text-white">Remove</Dialog.Trigger>
								<Dialog.Content>
									<Dialog.Header>
										<Dialog.Title>Are you sure you want to delete this todo?</Dialog.Title>
										<Dialog.Description>
											This action cannot be undone. This will permanently delete the todo item.
										</Dialog.Description>
									</Dialog.Header>
									<Dialog.Footer>
										<Dialog.Close>Cancel</Dialog.Close>
										<Button onclick={() => removeTodo(todo.id!)}>Confirm Delete</Button>
									</Dialog.Footer>
								</Dialog.Content>
							</Dialog.Root>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
			<Table.Footer>
				<Table.Row>
					<Table.Cell colspan={7} class="bg-white">
						<Dialog.Root bind:open={isDialogOpen}>
							<Dialog.Trigger class="w-full">
								<Button variant="outline" class="w-full">
									<Plus />
								</Button>
							</Dialog.Trigger>
							<Dialog.Content>
								<Dialog.Header>
									<Dialog.Title>Add New Todo</Dialog.Title>
									<Dialog.Description>Create a new todo item</Dialog.Description>
								</Dialog.Header>
								<TodoInput />
							</Dialog.Content>
						</Dialog.Root>
					</Table.Cell>
				</Table.Row>
			</Table.Footer>
		</Table.Root>
	</TableWrapper>

	{#if isEditDialogOpen && currentEditTodo}
		<Dialog.Root open={isEditDialogOpen} onOpenChange={(open) => (isEditDialogOpen = open)}>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Edit Todo Description</Dialog.Title>
					<Dialog.Description>
						Update the description for "{currentEditTodo.text}"
					</Dialog.Description>
				</Dialog.Header>
				<div class="grid gap-4 py-4">
					<div class="grid-cols- grid items-center gap-4">
						<Input id="description" bind:value={editDescription} class="col-span-3" />
					</div>
				</div>

				<Dialog.Footer>
					<Dialog.Close>Cancel</Dialog.Close>
					<Button onclick={updateTodoDescription}>Save</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	{/if}
{/if}

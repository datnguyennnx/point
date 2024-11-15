<script lang="ts">
import { page } from '$app/stores'
import { goto } from '$app/navigation'
import * as Card from '$lib/components/ui/card'
import * as Table from '$lib/components/ui/table/index.js'
import { Badge } from '$lib/components/ui/badge/index.js'
import * as Dialog from '$lib/components/ui/dialog/index.js'
import { Checkbox } from '$lib/components/ui/checkbox/index.js'
import { Button } from '$lib/components/ui/button/index.js'
import { Input } from '$lib/components/ui/input/index.js'
import { Plus, Expand, Edit } from 'lucide-svelte'

import Canvas from '$lib/components/common/Canvas/Canvas.svelte'
import TableWrapper from '$lib/components/common/Canvas/TableWrapper.svelte'
import { tododb } from '$lib/database/todo-db'
import type { Todo } from '$lib/database/todo-db'
import TodoInput from '$lib/components/todos/TodoInput.svelte'
import TodoFilter from '$lib/components/todos/TodoFilter.svelte'
import TodoList from '$lib/components/todos/TodoList.svelte'

// Centralized filter state
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

// Function to fetch stats
async function fetchStats() {
	if (!databaseReady) return

	try {
		const todoStats = await tododb.getTodoStats()
		stats = {
			total: todoStats.total,
			completed: todoStats.completed,
		}
	} catch (error) {
		console.error('Failed to fetch todo stats:', error)
	}
}

// Table-specific functions
async function toggleTodo(id: number) {
	await tododb.toggleTodo(id)
	todos = await tododb.getTodos()
	await fetchStats()
}

async function removeTodo(id: number) {
	await tododb.deleteTodo(id)
	todos = await tododb.getTodos()
	await fetchStats()
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
		todos = await tododb.getTodos()
		isEditDialogOpen = false
		currentEditTodo = null
	} catch (error) {
		console.error('Failed to update todo description:', error)
	}
}

// Use $state for stats
let stats = $state({
	total: 0,
	completed: 0,
})

// Reactive fetch when todos change
$effect(() => {
	if (!databaseReady) return

	const unsubscribe = tododb.onChange(async () => {
		await fetchStats()
		todos = await tododb.getTodos()
	})

	return () => {
		unsubscribe()
	}
})

// Fetch todos on mount
$effect(() => {
	async function initializeTodos() {
		const fetchedTodos = await tododb.getTodos()
		todos = fetchedTodos
		databaseReady = true
		await fetchStats()
	}
	initializeTodos()
})
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
					<Table.Head class="w-[100px]">ID</Table.Head>
					<Table.Head>Task</Table.Head>
					<Table.Head>Description</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="text-right">Created At</Table.Head>
					<Table.Head class="text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each todos as todo, i (i)}
					<Table.Row>
						<Table.Cell>
							<Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id!)} />
						</Table.Cell>
						<Table.Cell class="font-medium">{todo.id}</Table.Cell>
						<Table.Cell>{todo.text}</Table.Cell>
						<Table.Cell class="flex flex-row items-center text-gray-500">
							{todo.description || '-'}
							<Button variant="ghost" size="icon" class="ml-2" onclick={() => openEditDialog(todo)}>
								<Edit class="h-4 w-4" />
							</Button>
						</Table.Cell>
						<Table.Cell>
							<Badge variant={todo.completed ? 'success' : 'warning'}>
								{todo.completed ? 'Completed' : 'Pending'}
							</Badge>
						</Table.Cell>
						<Table.Cell class="text-right">{new Date(todo.createdAt).toLocaleString()}</Table.Cell>
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
					<Table.Cell colspan={7}>
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

import Dexie, { type Table } from 'dexie'
import type { Todo } from './types'

export class TodoDB extends Dexie {
	todos!: Table<Todo, number>

	constructor() {
		super('TodoDatabase')
		this.version(1).stores({
			todos: '++id, text, completed, createdAt',
		})
	}

	/**
	 * Add a new todo item
	 * @param text The text content of the todo
	 * @returns The id of the newly created todo
	 */
	async addTodo(text: string): Promise<number> {
		try {
			const todo: Omit<Todo, 'id'> = {
				text: text.trim(),
				completed: false,
				createdAt: Date.now(),
			}
			const id = await this.todos.add(todo)
			return id
		} catch (error) {
			console.error('Failed to add todo:', error)
			throw new Error('Failed to add todo')
		}
	}

	/**
	 * Toggle the completed status of a todo
	 * @param id The id of the todo to toggle
	 */
	async toggleTodo(id: number): Promise<void> {
		try {
			const todo = await this.todos.get(id)
			if (!todo) throw new Error('Todo not found')

			await this.todos.update(id, {
				completed: !todo.completed,
			})
		} catch (error) {
			console.error('Failed to toggle todo:', error)
			throw new Error('Failed to toggle todo')
		}
	}

	/**
	 * Delete a todo item
	 * @param id The id of the todo to delete
	 */
	async deleteTodo(id: number): Promise<void> {
		try {
			await this.todos.delete(id)
		} catch (error) {
			console.error('Failed to delete todo:', error)
			throw new Error('Failed to delete todo')
		}
	}

	/**
	 * Get all todos
	 * @returns Array of all todos
	 */
	async getTodos(): Promise<Todo[]> {
		try {
			return await this.todos.orderBy('createdAt').reverse().toArray()
		} catch (error) {
			console.error('Failed to get todos:', error)
			throw new Error('Failed to get todos')
		}
	}

	/**
	 * Get filtered todos based on completion status
	 * @param filter The filter to apply ('all' | 'active' | 'completed')
	 * @returns Filtered array of todos
	 */
	async getFilteredTodos(filter: 'all' | 'active' | 'completed'): Promise<Todo[]> {
		try {
			if (filter === 'all') {
				return this.getTodos()
			}

			return await this.todos
				.filter((todo) => (filter === 'completed' ? todo.completed : !todo.completed))
				.reverse()
				.sortBy('createdAt')
		} catch (error) {
			console.error('Failed to get filtered todos:', error)
			throw new Error('Failed to get filtered todos')
		}
	}

	/**
	 * Update a todo's text
	 * @param id The id of the todo to update
	 * @param text The new text content
	 */
	async updateTodoText(id: number, text: string): Promise<void> {
		try {
			const trimmedText = text.trim()
			if (!trimmedText) throw new Error('Todo text cannot be empty')

			await this.todos.update(id, { text: trimmedText })
		} catch (error) {
			console.error('Failed to update todo text:', error)
			throw new Error('Failed to update todo text')
		}
	}

	/**
	 * Get todo statistics
	 * @returns Object containing todo statistics
	 */
	async getTodoStats(): Promise<{ total: number; completed: number; active: number }> {
		try {
			const allTodos = await this.getTodos()
			return {
				total: allTodos.length,
				completed: allTodos.filter((t) => t.completed).length,
				active: allTodos.filter((t) => !t.completed).length,
			}
		} catch (error) {
			console.error('Failed to get todo stats:', error)
			throw new Error('Failed to get todo stats')
		}
	}

	/**
	 * Delete all completed todos
	 * @returns Number of todos deleted
	 */
	async clearCompletedTodos(): Promise<number> {
		try {
			const completedTodos = await this.todos.where('completed').equals('true').toArray()

			await this.todos.where('completed').equals('true').delete()

			return completedTodos.length
		} catch (error) {
			console.error('Failed to clear completed todos:', error)
			throw new Error('Failed to clear completed todos')
		}
	}

	/**
	 * Mark all todos as completed or active
	 * @param completed Whether to mark todos as completed or active
	 */
	async toggleAllTodos(completed: boolean): Promise<void> {
		try {
			await this.todos
				.where('completed')
				.notEqual(completed ? 'true' : 'false')
				.modify({ completed })
		} catch (error) {
			console.error('Failed to toggle all todos:', error)
			throw new Error('Failed to toggle all todos')
		}
	}

	/**
	 * Search todos by text
	 * @param searchText The text to search for
	 * @returns Array of matching todos
	 */
	async searchTodos(searchText: string): Promise<Todo[]> {
		try {
			const trimmedText = searchText.trim().toLowerCase()
			if (!trimmedText) return this.getTodos()

			return await this.todos
				.filter((todo) => todo.text.toLowerCase().includes(trimmedText))
				.reverse()
				.sortBy('createdAt')
		} catch (error) {
			console.error('Failed to search todos:', error)
			throw new Error('Failed to search todos')
		}
	}
}

export const tododb = new TodoDB()

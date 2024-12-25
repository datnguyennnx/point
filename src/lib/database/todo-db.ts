import { databaseManager } from './database'
import { z } from 'zod'
import type { PGlite } from '@electric-sql/pglite'

// Enhanced type validation with Zod
const TodoSchema = z.object({
	id: z.number().optional(),
	text: z
		.string()
		.min(1, 'Todo text is required')
		.max(100, 'Todo text must be 100 characters or less'),
	description: z.string().max(500, 'Description must be 500 characters or less').optional(),
	completed: z.boolean(),
	createdAt: z.number().positive('Created timestamp must be a positive number'),
})

export type Todo = z.infer<typeof TodoSchema>

interface TodoRow {
	id: number
	text: string
	description?: string
	completed: boolean
	created_at: number
}

interface TodoStats {
	total: number
	completed: number
	active: number
}

export class Todos {
	private static instance: Todos
	private changeListeners: Set<() => void> = new Set()
	private db: PGlite | null = null

	private constructor() {}

	public static getInstance(): Todos {
		if (!Todos.instance) {
			Todos.instance = new Todos()
		}
		return Todos.instance
	}

	private async getDatabase() {
		if (!this.db) {
			this.db = await databaseManager.getDatabase()
		}
		return this.db
	}

	// Enhanced change listener management
	onChange(callback: () => void): () => void {
		this.changeListeners.add(callback)
		return () => this.changeListeners.delete(callback)
	}

	private notifyChanges() {
		// Use microtask to batch change notifications
		queueMicrotask(() => {
			this.changeListeners.forEach((listener) => listener())
		})
	}

	// Comprehensive todo validation
	private validateTodo(todo: Omit<Todo, 'id'>): void {
		const result = TodoSchema.omit({ id: true }).safeParse(todo)
		if (!result.success) {
			const errorMessages = result.error.errors.map((err) => err.message).join(', ')
			throw new Error(`Invalid todo: ${errorMessages}`)
		}
	}

	async addTodo(text: string, description?: string): Promise<number> {
		const todoData = {
			text: text.trim(),
			description: description?.trim(),
			completed: false,
			createdAt: Date.now(),
		}

		this.validateTodo(todoData)

		const db = await this.getDatabase()

		try {
			const result = await db.query(
				'INSERT INTO todos (text, description, completed, created_at) VALUES ($1, $2, $3, $4) RETURNING id',
				[todoData.text, todoData.description || null, todoData.completed, todoData.createdAt],
			)

			this.notifyChanges()
			return (result.rows[0] as { id: number }).id
		} catch (error: unknown) {
			console.error('Todo addition failed:', error)
			throw new Error('Failed to add todo')
		}
	}

	async getTodoStats(): Promise<TodoStats> {
		const db = await this.getDatabase()

		try {
			const result = await db.query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN completed THEN 1 END) as completed,
                    COUNT(CASE WHEN NOT completed THEN 1 END) as active
                FROM todos
            `)

			const row = result.rows[0] as TodoStats
			return row || { total: 0, completed: 0, active: 0 }
		} catch (error) {
			console.error('Failed to get todo stats:', error)
			return { total: 0, completed: 0, active: 0 }
		}
	}

	async getTodos(): Promise<Todo[]> {
		const db = await this.getDatabase()

		try {
			const result = await db.query('SELECT * FROM todos ORDER BY created_at DESC')
			return (result.rows as TodoRow[]).map(this.mapTodo)
		} catch (error) {
			console.error('Failed to fetch todos:', error)
			return []
		}
	}

	async getFilteredTodos(filter: 'all' | 'active' | 'completed'): Promise<Todo[]> {
		if (filter === 'all') return await this.getTodos()

		const db = await this.getDatabase()

		try {
			const result = await db.query(
				'SELECT * FROM todos WHERE completed = $1 ORDER BY created_at DESC',
				[filter === 'completed'],
			)

			return (result.rows as TodoRow[]).map(this.mapTodo)
		} catch (error) {
			console.error(`Failed to fetch ${filter} todos:`, error)
			return []
		}
	}

	async toggleTodo(id: number): Promise<void> {
		if (!id || id <= 0) {
			throw new Error('Invalid todo ID')
		}

		const db = await this.getDatabase()

		try {
			await db.query('UPDATE todos SET completed = NOT completed WHERE id = $1', [id])
			this.notifyChanges()
		} catch (error) {
			console.error('Failed to toggle todo:', error)
			throw new Error('Failed to toggle todo status')
		}
	}

	async deleteTodo(id: number): Promise<void> {
		if (!id || id <= 0) {
			throw new Error('Invalid todo ID')
		}

		const db = await this.getDatabase()

		try {
			await db.query('DELETE FROM todos WHERE id = $1', [id])
			this.notifyChanges()
		} catch (error) {
			console.error('Failed to delete todo:', error)
			throw new Error('Failed to delete todo')
		}
	}

	async updateTodoText(id: number, text: string, description?: string): Promise<void> {
		const todoData = {
			text: text.trim(),
			description: description?.trim(),
			completed: false,
			createdAt: Date.now(),
		}

		this.validateTodo(todoData)

		const db = await this.getDatabase()

		try {
			await db.query('UPDATE todos SET text = $1, description = $2 WHERE id = $3', [
				todoData.text,
				todoData.description || null,
				id,
			])
			this.notifyChanges()
		} catch (error) {
			console.error('Failed to update todo:', error)
			throw new Error('Failed to update todo')
		}
	}

	async clearCompletedTodos(): Promise<number> {
		const db = await this.getDatabase()

		try {
			const result = await db.query('DELETE FROM todos WHERE completed = true RETURNING id')
			this.notifyChanges()
			return result.rows.length
		} catch (error) {
			console.error('Failed to clear completed todos:', error)
			return 0
		}
	}

	async toggleAllTodos(completed: boolean): Promise<void> {
		const db = await this.getDatabase()

		try {
			await db.query('UPDATE todos SET completed = $1', [completed])
			this.notifyChanges()
		} catch (error) {
			console.error('Failed to toggle all todos:', error)
			throw new Error('Failed to toggle all todos')
		}
	}

	private mapTodo(row: TodoRow): Todo {
		return {
			id: row.id,
			text: row.text,
			description: row.description,
			completed: row.completed,
			createdAt: row.created_at,
		}
	}
}

export const tododb = Todos.getInstance()

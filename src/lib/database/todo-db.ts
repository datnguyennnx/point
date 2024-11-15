import { databaseManager } from './database'
import type { PGlite } from '@electric-sql/pglite'

// Todo type definition
export interface Todo {
	id?: number
	text: string
	description?: string // Added optional description
	completed: boolean
	createdAt: number
}

interface TodoRow {
	id: number
	text: string
	description?: string // Added optional description
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

	onChange(callback: () => void): () => void {
		this.changeListeners.add(callback)
		return () => this.changeListeners.delete(callback)
	}

	private notifyChanges() {
		this.changeListeners.forEach((listener) => listener())
	}

	async addTodo(text: string, description?: string): Promise<number> {
		const db = await this.getDatabase()
		const result = await db.query(
			'INSERT INTO todos (text, description, completed, created_at) VALUES ($1, $2, $3, $4) RETURNING id',
			[text.trim(), description?.trim() || null, false, Date.now()],
		)

		this.notifyChanges()
		return (result.rows[0] as { id: number }).id
	}

	async getTodoStats(): Promise<TodoStats> {
		const db = await this.getDatabase()
		const result = await db.query(`
			SELECT 
				COUNT(*) as total,
				COUNT(CASE WHEN completed THEN 1 END) as completed,
				COUNT(CASE WHEN NOT completed THEN 1 END) as active
			FROM todos
		`)

		const row = result.rows[0] as TodoStats
		return row || { total: 0, completed: 0, active: 0 }
	}

	async getTodos(): Promise<Todo[]> {
		const db = await this.getDatabase()
		const result = await db.query('SELECT * FROM todos ORDER BY created_at DESC')

		return (result.rows as TodoRow[]).map((row) => ({
			id: row.id,
			text: row.text,
			description: row.description,
			completed: row.completed,
			createdAt: row.created_at,
		}))
	}

	async getFilteredTodos(filter: 'all' | 'active' | 'completed'): Promise<Todo[]> {
		if (filter === 'all') return this.getTodos()

		const db = await this.getDatabase()
		const result = await db.query(
			'SELECT * FROM todos WHERE completed = $1 ORDER BY created_at DESC',
			[filter === 'completed'],
		)

		return (result.rows as TodoRow[]).map((row) => ({
			id: row.id,
			text: row.text,
			description: row.description,
			completed: row.completed,
			createdAt: row.created_at,
		}))
	}

	async toggleTodo(id: number): Promise<void> {
		const db = await this.getDatabase()
		await db.query('UPDATE todos SET completed = NOT completed WHERE id = $1', [id])
		this.notifyChanges()
	}

	async deleteTodo(id: number): Promise<void> {
		const db = await this.getDatabase()
		await db.query('DELETE FROM todos WHERE id = $1', [id])
		this.notifyChanges()
	}

	async updateTodoText(id: number, text: string, description?: string): Promise<void> {
		const trimmedText = text.trim()
		if (!trimmedText) throw new Error('Todo text cannot be empty')

		const db = await this.getDatabase()
		await db.query('UPDATE todos SET text = $1, description = $2 WHERE id = $3', [
			trimmedText,
			description?.trim() || null,
			id,
		])
		this.notifyChanges()
	}

	async clearCompletedTodos(): Promise<number> {
		const db = await this.getDatabase()
		const result = await db.query('DELETE FROM todos WHERE completed = true RETURNING id')
		this.notifyChanges()
		return result.rows.length
	}

	async toggleAllTodos(completed: boolean): Promise<void> {
		const db = await this.getDatabase()
		await db.query('UPDATE todos SET completed = $1', [completed])
		this.notifyChanges()
	}
}

export const tododb = Todos.getInstance()

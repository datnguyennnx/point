import { PGlite } from '@electric-sql/pglite'

// Todo type definition
export interface Todo {
	id?: number
	text: string
	completed: boolean
	createdAt: number
}

// Precise interfaces for database interactions
interface TodoRow {
	id: number
	text: string
	completed: boolean
	created_at: number
}

interface StatsQueryRow {
	total: number
	completed: number
	active: number
}

interface QueryResult<T> {
	rows: T[]
}

export class TodoDB {
	private static instance: TodoDB
	private db: PGlite
	private initialized: boolean = false
	private changeListeners: Set<() => void> = new Set()

	private constructor() {
		this.db = new PGlite('idb://TodoDatabase')
	}

	public static getInstance(): TodoDB {
		if (!TodoDB.instance) {
			TodoDB.instance = new TodoDB()
		}
		return TodoDB.instance
	}

	/**
	 * Register a change listener
	 */
	onChange(callback: () => void): () => void {
		this.changeListeners.add(callback)
		return () => {
			this.changeListeners.delete(callback)
		}
	}

	/**
	 * Notify all change listeners
	 */
	private notifyChanges() {
		this.changeListeners.forEach((listener) => listener())
	}

	/**
	 * Initialize the database
	 */
	async init(): Promise<void> {
		if (this.initialized) return

		try {
			await this.db.exec(`
                CREATE TABLE IF NOT EXISTS todos (
                    id SERIAL PRIMARY KEY,
                    text TEXT NOT NULL,
                    completed BOOLEAN DEFAULT false,
                    created_at BIGINT NOT NULL
                );
            `)

			this.initialized = true
		} catch (error) {
			console.error('Failed to initialize database:', error)
			this.initialized = false
			throw error
		}
	}

	/**
	 * Add a new todo item
	 */
	async addTodo(text: string): Promise<number> {
		try {
			const result = (await this.db.query(
				'INSERT INTO todos (text, completed, created_at) VALUES ($1, $2, $3) RETURNING id',
				[text.trim(), false, Date.now()],
			)) as QueryResult<{ id: number }>

			if (!result.rows || result.rows.length === 0) {
				throw new Error('No rows returned from insert')
			}

			const id = result.rows[0].id
			this.notifyChanges()
			return id
		} catch (error) {
			console.error('Failed to add todo:', error)
			throw new Error('Failed to add todo')
		}
	}

	/**
	 * Get todo statistics
	 */
	async getTodoStats(): Promise<StatsQueryRow> {
		try {
			const result = (await this.db.query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN completed THEN 1 END) as completed,
                    COUNT(CASE WHEN NOT completed THEN 1 END) as active
                FROM todos
            `)) as QueryResult<StatsQueryRow>

			if (!result.rows || result.rows.length === 0) {
				return { total: 0, completed: 0, active: 0 }
			}

			return result.rows[0]
		} catch (error) {
			console.error('Failed to get todo stats:', error)
			throw new Error('Failed to get todo stats')
		}
	}

	/**
	 * Get all todos
	 */
	async getTodos(): Promise<Todo[]> {
		try {
			const result = (await this.db.query(
				'SELECT * FROM todos ORDER BY created_at DESC',
			)) as QueryResult<TodoRow>

			return result.rows.map(this.mapTodoSafely)
		} catch (error) {
			console.error('Failed to get todos:', error)
			throw new Error('Failed to get todos')
		}
	}

	/**
	 * Get filtered todos based on completion status
	 */
	async getFilteredTodos(filter: 'all' | 'active' | 'completed'): Promise<Todo[]> {
		try {
			console.log(`Fetching todos with filter: ${filter}`)

			if (filter === 'all') {
				const allTodos = await this.getTodos()
				console.log('All todos:', allTodos)
				return allTodos
			}

			const result = (await this.db.query(
				'SELECT * FROM todos WHERE completed = $1 ORDER BY created_at DESC',
				[filter === 'completed'],
			)) as QueryResult<TodoRow>

			const filteredTodos = result.rows.map(this.mapTodoSafely)
			console.log(`${filter} todos:`, filteredTodos)

			return filteredTodos
		} catch (error) {
			console.error('Failed to get filtered todos:', error)
			throw new Error('Failed to get filtered todos')
		}
	}

	/**
	 * Safely map a database row to Todo type
	 */
	private mapTodoSafely(row: TodoRow): Todo {
		return {
			id: row.id,
			text: row.text,
			completed: row.completed,
			createdAt: row.created_at,
		}
	}

	/**
	 * Toggle the completed status of a todo
	 */
	async toggleTodo(id: number): Promise<void> {
		try {
			await this.db.query('UPDATE todos SET completed = NOT completed WHERE id = $1', [id])
			this.notifyChanges()
		} catch (error) {
			console.error('Failed to toggle todo:', error)
			throw new Error('Failed to toggle todo')
		}
	}

	/**
	 * Delete a todo item
	 */
	async deleteTodo(id: number): Promise<void> {
		try {
			await this.db.query('DELETE FROM todos WHERE id = $1', [id])
			this.notifyChanges()
		} catch (error) {
			console.error('Failed to delete todo:', error)
			throw new Error('Failed to delete todo')
		}
	}

	/**
	 * Update a todo's text
	 */
	async updateTodoText(id: number, text: string): Promise<void> {
		try {
			const trimmedText = text.trim()
			if (!trimmedText) throw new Error('Todo text cannot be empty')

			await this.db.query('UPDATE todos SET text = $1 WHERE id = $2', [trimmedText, id])
			this.notifyChanges()
		} catch (error) {
			console.error('Failed to update todo text:', error)
			throw new Error('Failed to update todo text')
		}
	}

	/**
	 * Delete all completed todos
	 */
	async clearCompletedTodos(): Promise<number> {
		try {
			const result = (await this.db.query(
				'DELETE FROM todos WHERE completed = true RETURNING id',
			)) as QueryResult<{ id: number }>

			this.notifyChanges()
			return result.rows.length
		} catch (error) {
			console.error('Failed to clear completed todos:', error)
			throw new Error('Failed to clear completed todos')
		}
	}

	/**
	 * Mark all todos as completed or active
	 */
	async toggleAllTodos(completed: boolean): Promise<void> {
		try {
			await this.db.query('UPDATE todos SET completed = $1', [completed])
			this.notifyChanges()
		} catch (error) {
			console.error('Failed to toggle all todos:', error)
			throw new Error('Failed to toggle all todos')
		}
	}
}
// Singleton export
export const tododb = TodoDB.getInstance()

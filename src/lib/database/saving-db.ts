import { databaseManager } from './database'
import type { PGlite } from '@electric-sql/pglite'
import { z } from 'zod'

// Enhanced type validation with Zod
const TransactionSchema = z.object({
	id: z.number().optional(),
	amount: z.number().positive('Amount must be positive'),
	description: z.string().min(1, 'Description is required'),
	type: z.enum(['income', 'expense'], {
		errorMap: () => ({ message: 'Type must be either income or expense' }),
	}),
	tags: z.array(z.string()).optional().default([]),
	category: z.string().min(1, 'Category is required'),
	categoryColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid color format'),
	date: z.number().positive('Date must be a positive timestamp'),
})

export type Transaction = z.infer<typeof TransactionSchema>

interface TransactionRow {
	id: number
	amount: number
	description: string
	type: string
	tags: string[]
	category: string
	category_color: string
	date: number
}

interface BalanceRow {
	balance: number
}

export class Savings {
	private static instance: Savings
	private changeListeners: Set<() => void> = new Set()
	private db: PGlite | null = null

	private constructor() {}

	public static getInstance(): Savings {
		if (!Savings.instance) {
			Savings.instance = new Savings()
		}
		return Savings.instance
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

	// Comprehensive transaction validation
	private validateTransaction(transaction: Omit<Transaction, 'id'>): void {
		const result = TransactionSchema.omit({ id: true }).safeParse(transaction)
		if (!result.success) {
			const errorMessages = result.error.errors.map((err) => err.message).join(', ')
			throw new Error(`Invalid transaction: ${errorMessages}`)
		}
	}

	async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<number> {
		// Validate transaction before processing
		this.validateTransaction(transaction)

		const db = await this.getDatabase()

		try {
			const result = await db.query(
				`INSERT INTO transactions 
                (amount, description, type, tags, category, category_color, date)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id`,
				[
					transaction.amount,
					transaction.description,
					transaction.type,
					transaction.tags,
					transaction.category,
					transaction.categoryColor,
					Date.now(),
				],
			)

			this.notifyChanges()
			return (result.rows[0] as { id: number }).id
		} catch (error: unknown) {
			console.error('Transaction addition failed:', error)
			throw new Error('Failed to add transaction')
		}
	}

	async getTransactions(options?: {
		limit?: number
		offset?: number
		type?: 'income' | 'expense'
	}): Promise<Transaction[]> {
		const db = await this.getDatabase()

		const { limit = 100, offset = 0, type } = options || {}

		const whereClause = type ? 'WHERE type = $3' : ''
		const queryParams = type ? [limit, offset, type] : [limit, offset]

		const result = await db.query(
			`
            SELECT * FROM transactions 
            ${whereClause}
            ORDER BY date DESC 
            LIMIT $1 OFFSET $2
        `,
			queryParams,
		)

		return (result.rows as TransactionRow[]).map(this.mapTransaction)
	}

	async deleteTransaction(id: number): Promise<void> {
		if (!id || id <= 0) {
			throw new Error('Invalid transaction ID')
		}

		const db = await this.getDatabase()

		try {
			await db.query('DELETE FROM transactions WHERE id = $1', [id])

			this.notifyChanges()
		} catch (error: unknown) {
			console.error('Transaction deletion failed:', error)
			throw error
		}
	}

	async getBalance(type?: 'income' | 'expense'): Promise<number> {
		const db = await this.getDatabase()

		const whereClause = type ? `WHERE type = '${type}'` : ''

		const result = await db.query(`
            SELECT COALESCE(
                SUM(CASE 
                    WHEN type = 'income' THEN amount 
                    ELSE -amount 
                END),
                0
            ) as balance 
            FROM transactions
            ${whereClause}
        `)

		return (result.rows[0] as BalanceRow).balance
	}

	private mapTransaction(row: TransactionRow): Transaction {
		return {
			id: row.id,
			amount: row.amount,
			description: row.description,
			type: row.type as 'income' | 'expense',
			tags: row.tags,
			category: row.category,
			categoryColor: row.category_color,
			date: row.date,
		}
	}
}

export const savingsdb = Savings.getInstance()

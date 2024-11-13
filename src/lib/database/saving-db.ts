import { PGlite } from '@electric-sql/pglite'

export interface Transaction {
	id?: number
	amount: number
	description: string
	type: 'income' | 'expense'
	tags: string[]
	category: string
	categoryColor: string
	date: number
}

export interface Tag {
	id?: number
	name: string
	color: string
	type: 'income' | 'expense' | 'both'
}

export class WalletDB {
	private static instance: WalletDB
	private db: PGlite
	private initialized: boolean = false

	private constructor() {
		this.db = new PGlite('idb://WalletDatabase')
	}

	public static getInstance(): WalletDB {
		if (!WalletDB.instance) {
			WalletDB.instance = new WalletDB()
		}
		return WalletDB.instance
	}

	/**
	 * Initialize the database
	 */
	async init(): Promise<void> {
		if (this.initialized) return

		try {
			await this.db.exec(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id SERIAL PRIMARY KEY,
                    amount DECIMAL NOT NULL,
                    description TEXT NOT NULL,
                    type TEXT CHECK (type IN ('income', 'expense')),
                    tags TEXT[] DEFAULT '{}',
                    category TEXT NOT NULL,
                    category_color TEXT NOT NULL,
                    date BIGINT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS tags (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE,
                    color TEXT NOT NULL,
                    type TEXT CHECK (type IN ('income', 'expense', 'both'))
                );
            `)

			this.initialized = true
		} catch (error) {
			console.error('Failed to initialize database:', error)
			this.initialized = false
			throw error
		}
	}

	// Transaction methods
	async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<number> {
		try {
			const result = await this.db.query(
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

			// Type assertion to handle potential unknown result
			const rows = result.rows as { id: number }[]
			return rows[0].id
		} catch (error) {
			console.error('Failed to add transaction:', error)
			throw new Error('Failed to add transaction')
		}
	}

	async getTransactions(): Promise<Transaction[]> {
		try {
			const result = await this.db.query('SELECT * FROM transactions ORDER BY date DESC')

			// Type assertion for rows
			const rows = result.rows as Array<Record<string, unknown>>
			return rows.map(this.mapTransaction)
		} catch (error) {
			console.error('Failed to get transactions:', error)
			throw new Error('Failed to get transactions')
		}
	}

	async deleteTransaction(id: number): Promise<void> {
		try {
			await this.db.query('DELETE FROM transactions WHERE id = $1', [id])
		} catch (error) {
			console.error('Failed to delete transaction:', error)
			throw new Error('Failed to delete transaction')
		}
	}

	// Tag methods
	async addTag(tag: Omit<Tag, 'id'>): Promise<number> {
		try {
			const result = await this.db.query(
				'INSERT INTO tags (name, color, type) VALUES ($1, $2, $3) RETURNING id',
				[tag.name, tag.color, tag.type],
			)

			// Type assertion to handle potential unknown result
			const rows = result.rows as { id: number }[]
			return rows[0].id
		} catch (error) {
			console.error('Failed to add tag:', error)
			throw new Error('Failed to add tag')
		}
	}

	async getTags(): Promise<Tag[]> {
		try {
			const result = await this.db.query('SELECT * FROM tags')

			// Type assertion for rows
			const rows = result.rows as Array<Record<string, unknown>>
			return rows.map(this.mapTag)
		} catch (error) {
			console.error('Failed to get tags:', error)
			throw new Error('Failed to get tags')
		}
	}

	async deleteTag(id: number): Promise<void> {
		try {
			// Use a transaction to remove tag from transactions and delete the tag
			await this.db.query(
				`
                WITH tag_removal AS (
                    UPDATE transactions 
                    SET tags = array_remove(tags, $1::text)
                    WHERE $1::text = ANY(tags)
                )
                DELETE FROM tags WHERE id = $1
            `,
				[id.toString()],
			)
		} catch (error) {
			console.error('Failed to delete tag:', error)
			throw new Error('Failed to delete tag')
		}
	}

	// Statistics methods
	async getBalance(): Promise<number> {
		try {
			const result = await this.db.query(`
                SELECT COALESCE(
                    SUM(CASE 
                        WHEN type = 'income' THEN amount 
                        ELSE -amount 
                    END),
                    0
                ) as balance 
                FROM transactions
            `)

			// Type assertion to handle potential unknown result
			const rows = result.rows as Array<{ balance: number }>
			return rows[0].balance
		} catch (error) {
			console.error('Failed to get balance:', error)
			throw new Error('Failed to get balance')
		}
	}

	// Helper methods for mapping database rows to interfaces
	private mapTransaction(row: Record<string, unknown>): Transaction {
		return {
			id: row.id as number,
			amount: Number(row.amount),
			description: row.description as string,
			type: row.type as 'income' | 'expense',
			tags: row.tags as string[],
			category: row.category as string,
			categoryColor: row.category_color as string,
			date: row.date as number,
		}
	}

	private mapTag(row: Record<string, unknown>): Tag {
		return {
			id: row.id as number,
			name: row.name as string,
			color: row.color as string,
			type: row.type as 'income' | 'expense' | 'both',
		}
	}

	// Existing database methods...
	// (addTransaction, getTransactions, etc. remain the same)
}

// Singleton export
export const savingsdb = WalletDB.getInstance()

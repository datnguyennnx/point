import { databaseManager } from './database'
import type { PGlite } from '@electric-sql/pglite'

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

	onChange(callback: () => void): () => void {
		this.changeListeners.add(callback)
		return () => this.changeListeners.delete(callback)
	}

	private notifyChanges() {
		this.changeListeners.forEach((listener) => listener())
	}

	async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<number> {
		const db = await this.getDatabase()
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
	}

	async getTransactions(): Promise<Transaction[]> {
		const db = await this.getDatabase()
		const result = await db.query('SELECT * FROM transactions ORDER BY date DESC')

		return (result.rows as TransactionRow[]).map(this.mapTransaction)
	}

	async deleteTransaction(id: number): Promise<void> {
		const db = await this.getDatabase()
		await db.query('DELETE FROM transactions WHERE id = $1', [id])
		this.notifyChanges()
	}

	async getBalance(): Promise<number> {
		const db = await this.getDatabase()
		const result = await db.query(`
            SELECT COALESCE(
                SUM(CASE 
                    WHEN type = 'income' THEN amount 
                    ELSE -amount 
                END),
                0
            ) as balance 
            FROM transactions
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

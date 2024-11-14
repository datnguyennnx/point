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

export interface Tag {
	id?: number
	name: string
	color: string
	type: 'income' | 'expense' | 'both'
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

interface TagRow {
	id: number
	name: string
	color: string
	type: string
}

interface BalanceRow {
	balance: number
}

export class Savings {
	private static instance: Savings
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
	}

	async addTag(tag: Omit<Tag, 'id'>): Promise<number> {
		const db = await this.getDatabase()
		const result = await db.query(
			'INSERT INTO tags (name, color, type) VALUES ($1, $2, $3) RETURNING id',
			[tag.name, tag.color, tag.type],
		)

		return (result.rows[0] as { id: number }).id
	}

	async getTags(): Promise<Tag[]> {
		const db = await this.getDatabase()
		const result = await db.query('SELECT * FROM tags')

		return (result.rows as TagRow[]).map(this.mapTag)
	}

	async deleteTag(id: number): Promise<void> {
		const db = await this.getDatabase()
		await db.query(
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

	private mapTag(row: TagRow): Tag {
		return {
			id: row.id,
			name: row.name,
			color: row.color,
			type: row.type as 'income' | 'expense' | 'both',
		}
	}
}

export const savingsdb = Savings.getInstance()

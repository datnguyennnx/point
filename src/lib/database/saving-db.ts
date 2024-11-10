import Dexie, { type Table } from 'dexie'
import type { Transaction, Tag } from './types'

export class WalletDB extends Dexie {
	transactions!: Table<Transaction, number>
	tags!: Table<Tag, number>

	constructor() {
		super('WalletDatabase')
		this.version(1).stores({
			transactions: '++id, type, category, date',
			tags: '++id, name, type',
		})
	}

	// Transaction methods
	async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<number> {
		try {
			return await this.transactions.add({
				...transaction,
				date: Date.now(),
			})
		} catch (error) {
			console.error('Failed to add transaction:', error)
			throw new Error('Failed to add transaction')
		}
	}

	async getTransactions(): Promise<Transaction[]> {
		try {
			return await this.transactions.orderBy('date').reverse().toArray()
		} catch (error) {
			console.error('Failed to get transactions:', error)
			throw new Error('Failed to get transactions')
		}
	}

	async deleteTransaction(id: number): Promise<void> {
		try {
			await this.transactions.delete(id)
		} catch (error) {
			console.error('Failed to delete transaction:', error)
			throw new Error('Failed to delete transaction')
		}
	}

	// Tag methods
	async addTag(tag: Omit<Tag, 'id'>): Promise<number> {
		try {
			return await this.tags.add(tag)
		} catch (error) {
			console.error('Failed to add tag:', error)
			throw new Error('Failed to add tag')
		}
	}

	async getTags(): Promise<Tag[]> {
		try {
			return await this.tags.toArray()
		} catch (error) {
			console.error('Failed to get tags:', error)
			throw new Error('Failed to get tags')
		}
	}

	// Add deleteTag method
	async deleteTag(id: number): Promise<void> {
		try {
			// First, get all transactions with this tag
			const transactions = await this.transactions.toArray()

			// Remove the tag from all transactions that use it
			const updates = transactions
				.filter((t) => t.tags.includes(id.toString()))
				.map((t) => ({
					...t,
					tags: t.tags.filter((tagId) => tagId !== id.toString()),
				}))

			// Update transactions in a transaction
			await this.transaction('rw', this.transactions, this.tags, async () => {
				// Delete the tag
				await this.tags.delete(id)

				// Update transactions that used this tag
				for (const update of updates) {
					if (update.id) {
						await this.transactions.update(update.id, { tags: update.tags })
					}
				}
			})
		} catch (error) {
			console.error('Failed to delete tag:', error)
			throw new Error('Failed to delete tag')
		}
	}

	// Statistics methods
	async getBalance(): Promise<number> {
		try {
			const transactions = await this.getTransactions()
			return transactions.reduce((acc, curr) => {
				return curr.type === 'income' ? acc + curr.amount : acc - curr.amount
			}, 0)
		} catch (error) {
			console.error('Failed to get balance:', error)
			throw new Error('Failed to get balance')
		}
	}
}

export const savingsdb = new WalletDB()

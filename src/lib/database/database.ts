import { DatabaseMigration } from './migrate'
import { PGlite } from '@electric-sql/pglite'

export class DatabaseManager {
	private static instance: DatabaseManager
	private db: PGlite | null = null

	private constructor() {}

	public static getInstance(): DatabaseManager {
		if (!DatabaseManager.instance) {
			DatabaseManager.instance = new DatabaseManager()
		}
		return DatabaseManager.instance
	}

	/**
	 * Initialize All Database Tables with Migration Support
	 */
	async initDatabase(): Promise<PGlite> {
		if (this.db) return this.db

		this.db = new PGlite('idb://AppDatabase')

		// Migration logic
		await DatabaseMigration.migrateDatabase(this.db)

		return this.db
	}

	/**
	 * Get the database instance
	 */
	async getDatabase(): Promise<PGlite> {
		if (!this.db) {
			await this.initDatabase()
		}
		return this.db!
	}
}

export const databaseManager = DatabaseManager.getInstance()

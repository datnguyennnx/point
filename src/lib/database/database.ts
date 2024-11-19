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
	 * Initialize All Database Tables in a Single Database
	 */
	async initDatabase(): Promise<PGlite> {
		if (this.db) return this.db

		this.db = new PGlite('idb://AppDatabase')

		await this.db.exec(`
            -- Todos Tables
            CREATE TABLE IF NOT EXISTS todos (
                id SERIAL PRIMARY KEY,
                text TEXT NOT NULL,
                description TEXT,
                completed BOOLEAN DEFAULT false,
                created_at BIGINT NOT NULL
            );
        `)

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

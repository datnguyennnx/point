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
            -- Savings Tables
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

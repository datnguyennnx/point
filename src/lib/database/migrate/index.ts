import { PGlite } from '@electric-sql/pglite'

// Interface for version query result
export interface VersionQueryResult {
	current_version: string
}

export class DatabaseMigration {
	private static readonly DB_VERSION = 2 // Increment version for new migration

	/**
	 * Handle Database Schema Migration
	 */
	static async migrateDatabase(db: PGlite): Promise<void> {
		try {
			// Check current database version
			const versionResult = await db.query<VersionQueryResult>(`
				SELECT current_setting('app.db_version', true) AS current_version
			`)

			const currentVersion =
				versionResult.rows.length > 0 ? parseInt(versionResult.rows[0]?.current_version ?? '1') : 1

			// Migration steps
			if (currentVersion < 2) {
				// Migrate todos table with new fields
				await db.exec(`
					-- Remove savings apps
					DROP TABLE IF EXISTS transactions;
					DROP TABLE IF EXISTS tags;

					-- Add new columns to todos table
					ALTER TABLE todos 
					ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
					ADD COLUMN IF NOT EXISTS data TEXT DEFAULT '';

					-- Set new database version
					SELECT set_config('app.db_version', '2', false);
				`)
			}
		} catch (error) {
			console.error('Database migration error:', error)

			// Log detailed error information
			if (error instanceof Error) {
				console.error('Error name:', error.name)
				console.error('Error message:', error.message)
				console.error('Error stack:', error.stack)
			}

			// Fallback to default migration if version check fails
			try {
				await this.performFallbackMigration(db)
			} catch (fallbackError) {
				console.error('Fallback migration failed:', fallbackError)
				// Potentially throw or handle critical failure
				throw new Error('Critical database migration failure')
			}
		}
	}

	/**
	 * Fallback migration method in case of version retrieval issues
	 */
	private static async performFallbackMigration(db: PGlite): Promise<void> {
		await db.exec(`
			-- Recreate todos table with new schema
			CREATE TABLE IF NOT EXISTS todos (
				id SERIAL PRIMARY KEY,
				text TEXT NOT NULL,
				description TEXT,
				data TEXT,
				completed BOOLEAN DEFAULT false,
				created_at BIGINT NOT NULL
			);
		`)
	}
}

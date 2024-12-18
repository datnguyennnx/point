// utils/logger.ts
export class Logger {
	static error(...args: any[]): void {
		console.error(new Date().toISOString(), '[ERROR]', ...args)
	}

	static debug(...args: any[]): void {
		if (process.env.NODE_ENV !== 'production') {
			console.debug(new Date().toISOString(), '[DEBUG]', ...args)
		}
	}
}

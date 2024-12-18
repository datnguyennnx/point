// src/lib/utils/date.ts
export function formatDate(date: number): string {
	return new Date(date).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

// Optional: Add more date utility functions as needed
export function isToday(date: number): boolean {
	const today = new Date()
	const targetDate = new Date(date)
	return (
		targetDate.getDate() === today.getDate() &&
		targetDate.getMonth() === today.getMonth() &&
		targetDate.getFullYear() === today.getFullYear()
	)
}

export function isYesterday(date: number): boolean {
	const yesterday = new Date()
	yesterday.setDate(yesterday.getDate() - 1)
	const targetDate = new Date(date)
	return (
		targetDate.getDate() === yesterday.getDate() &&
		targetDate.getMonth() === yesterday.getMonth() &&
		targetDate.getFullYear() === yesterday.getFullYear()
	)
}

// Helper to get relative time string
export function getRelativeTimeString(date: number): string {
	if (isToday(date)) {
		return 'Today'
	}
	if (isYesterday(date)) {
		return 'Yesterday'
	}
	return formatDate(date)
}

export const DEFAULT_COLORS = {
	income: '#22c55e', // green
	expense: '#ef4444', // red
	default: '#6366f1', // indigo
}

export const TRANSACTION_TYPES = [
	{ value: 'income', label: 'Income' },
	{ value: 'expense', label: 'Expense' },
] as const

export const CATEGORIES = [
	{ value: 'shopping', label: 'Shopping', defaultColor: '#FFBF61' },
	{ value: 'currency', label: 'Currency', defaultColor: '#B59F78' },
	{ value: 'eating', label: 'Eating', defaultColor: '#F87A53' },
	{ value: 'car', label: 'Car Driver', defaultColor: '#FD8B51' },
	{ value: 'other', label: 'Other', defaultColor: '#8ABFA3' },
]

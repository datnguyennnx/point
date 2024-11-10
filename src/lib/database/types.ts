export interface Todo {
	id?: number
	text: string
	completed: boolean
	createdAt: number
}

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

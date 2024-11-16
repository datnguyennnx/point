<script lang="ts">
import { z } from 'zod'
import { Input } from '$lib/components/ui/input'
import { Button } from '$lib/components/ui/button'
import * as Select from '$lib/components/ui/select'
import { savingsdb } from '$lib/database'
import { TRANSACTION_TYPES, CATEGORIES } from '$lib/constants/savings'
import CategoryIcon from './CategoryIcon.svelte'

// Transaction input schema for validation with optional tags
const TransactionInputSchema = z.object({
	amount: z.number().positive('Amount must be positive'),
	description: z.string().min(1, 'Description is required'),
	type: z.enum(['income', 'expense'], {
		errorMap: () => ({ message: 'Transaction type is required' }),
	}),
	tags: z.array(z.string()).optional().default([]),
	category: z.string().min(1, 'Category is required'),
	categoryColor: z.string().min(1, 'Category color is required'),
	date: z.number().positive('Date must be a valid timestamp'),
})

// Optimized reactive state with $state
let amount = $state('')
let description = $state('')
let type = $state<'income' | 'expense'>('expense')
let selectedTags = $state<string[]>([])
let selectedCategory = $state(CATEGORIES[0].value)
let categoryColor = $state(CATEGORIES[0].defaultColor)

// Optimized props with $props and type safety
let { onTransactionAdded = () => {} } = $props<{ onTransactionAdded?: () => void }>()

// Refined derived validation state with $derived.by for more complex logic
let isValidTransaction = $derived(() => {
	const numAmount = parseFloat(amount)
	return !isNaN(numAmount) && numAmount > 0 && description.trim().length > 0
})

// Memoized category change handler to prevent unnecessary re-renders
function handleCategoryChange(value: string) {
	const newCategory = CATEGORIES.find((c) => c.value === value)
	if (newCategory) {
		selectedCategory = newCategory.value
		categoryColor = newCategory.defaultColor
	}
}

// Add transaction function with comprehensive error handling
async function addTransaction() {
	if (!isValidTransaction) {
		console.error('Please fill in all required fields correctly')
		return
	}

	try {
		const transactionData = {
			amount: parseFloat(amount),
			description: description.trim(),
			type,
			tags: [...selectedTags],
			category: selectedCategory,
			categoryColor,
			date: Date.now(),
		}

		// Validate transaction data using Zod
		const validationResult = TransactionInputSchema.safeParse(transactionData)

		if (!validationResult.success) {
			const errorMessages = validationResult.error.errors.map((e) => e.message).join(', ')
			console.error(`Invalid transaction: ${errorMessages}`)
			return
		}

		await savingsdb.addTransaction(validationResult.data)

		// Reset form and notify parent
		resetForm()
		onTransactionAdded()
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error('Failed to add transaction:', error.message)
		} else {
			console.error('Failed to add transaction. Please try again.')
		}
	}
}

// Reset form function with explicit state reset
function resetForm() {
	amount = ''
	description = ''
	selectedTags = []
	selectedCategory = CATEGORIES[0].value
	categoryColor = CATEGORIES[0].defaultColor
}
</script>

<div class="space-y-4">
	<div class="grid grid-cols-2 gap-4">
		<Input
			type="number"
			placeholder="Amount"
			bind:value={amount}
			min="0"
			step="0.01"
			aria-label="Transaction Amount"
		/>
		<Select.Root type="single" bind:value={type}>
			<Select.Trigger class="w-full" aria-label="Transaction Type">
				{TRANSACTION_TYPES.find((t) => t.value === type)?.label}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					{#each TRANSACTION_TYPES as transactionType}
						<Select.Item value={transactionType.value} label={transactionType.label}>
							{transactionType.label}
						</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<Input
			type="text"
			placeholder="Description"
			bind:value={description}
			aria-label="Transaction Description"
		/>

		<Select.Root type="single" value={selectedCategory} onValueChange={handleCategoryChange}>
			<Select.Trigger class="w-full" aria-label="Transaction Category">
				<div class="flex items-center gap-2">
					{CATEGORIES.find((c) => c.value === selectedCategory)?.label}
				</div>
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					{#each CATEGORIES as category}
						<Select.Item value={category.value}>
							<div class="flex items-center gap-2">
								<CategoryIcon category={category.value} color={category.defaultColor} size={16} />
								{category.label}
							</div>
						</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>

	<Button
		variant="default"
		class="w-full"
		onclick={addTransaction}
		disabled={!isValidTransaction}
		aria-label="Add Transaction"
	>
		Add Transaction
	</Button>
</div>

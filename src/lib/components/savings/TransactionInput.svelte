<script lang="ts">
import { Input } from '$lib/components/ui/input'
import { Button } from '$lib/components/ui/button'
import * as Select from '$lib/components/ui/select'
import { savingsdb } from '$lib/database'
import { TRANSACTION_TYPES, CATEGORIES } from '$lib/constants/savings'
import CategoryIcon from './CategoryIcon.svelte'

let amount = $state('')
let description = $state('')
let type = $state<'income' | 'expense'>('expense')
let selectedTags = $state<string[]>([])
let selectedCategory = $state(CATEGORIES[0].value)
let categoryColor = $state(CATEGORIES[0].defaultColor)

let { onTransactionAdded } = $props<{ onTransactionAdded: () => void }>() // Updated prop definition

function handleCategoryChange(value: string) {
	selectedCategory = value
	const newCategory = CATEGORIES.find((c) => c.value === value)
	if (newCategory) {
		categoryColor = newCategory.defaultColor
	}
}

async function addTransaction() {
	if (!amount || !description) return
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
		await savingsdb.addTransaction(transactionData)

		// Notify parent component to reload transactions
		onTransactionAdded()

		// Reset form
		amount = ''
		description = ''
		selectedTags = []
		selectedCategory = CATEGORIES[0].value
		categoryColor = CATEGORIES[0].defaultColor
	} catch (error) {
		console.error('Failed to add transaction:', error)
	}
}
</script>

<div class="space-y-4">
	<div class="grid grid-cols-2 gap-4">
		<Input type="number" placeholder="Amount" bind:value={amount} min="0" step="0.01" />
		<Select.Root type="single" bind:value={type}>
			<Select.Trigger class="w-full">
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
		<Input type="text" placeholder="Description" bind:value={description} />

		<Select.Root type="single" value={selectedCategory} onValueChange={handleCategoryChange}>
			<Select.Trigger class="w-full">
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
		disabled={!amount || !description}
	>
		Add Transaction
	</Button>
</div>

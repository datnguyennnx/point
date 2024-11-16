<script lang="ts">
import { Button } from '$lib/components/ui/button'
import { Trash2 } from 'lucide-svelte'
import { formatCurrency } from '$lib/utils/currency'
import { hexToRGBA } from '$lib/utils/color'
import CategoryIcon from './CategoryIcon.svelte'
import type { Transaction } from '$lib/database/saving-db'

// Optimized props with $props and default values
let { transaction, onDelete = () => {} } = $props<{
	transaction: Transaction
	onDelete?: (id: number) => void
}>()

// Memoized background color derivation
let backgroundColor = $derived.by(() => hexToRGBA(transaction.categoryColor, 0.2))

// Utility function for capitalization (kept as pure function)
function capitalizeFirstLetter(val: string) {
	return String(val).charAt(0).toUpperCase() + String(val).slice(1)
}

// Enhanced derived transaction display properties with more robust logic
let displayProps = $derived.by(() => {
	const category = capitalizeFirstLetter(transaction.category)
	const isIncome = transaction.type === 'income'

	return {
		category,
		amountClass: isIncome ? 'text-green-600' : 'text-red-600',
		amountPrefix: isIncome ? '+' : '-',
		formattedAmount: formatCurrency(transaction.amount),
		formattedDate: new Date(transaction.date).toLocaleDateString(),
	}
})
</script>

<div
	class="flex w-full flex-col items-start justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:gap-0"
	style:background-color={backgroundColor}
	data-transaction-category={transaction.category}
	data-transaction-type={transaction.type}
>
	<div class="flex w-full items-center gap-2">
		<div class="shrink-0 rounded-full p-2">
			<CategoryIcon category={transaction.category} color={transaction.categoryColor} size={20} />
		</div>
		<div class="flex w-full min-w-0 flex-col sm:flex-row sm:items-center sm:space-x-4">
			<p class="w-full min-w-0 truncate pr-2 font-medium" data-category="true">
				{displayProps.category}
			</p>
		</div>
	</div>
	<div class="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
		<div
			class={`${displayProps.amountClass} w-full min-w-0 truncate whitespace-nowrap text-right`}
			data-amount="true"
		>
			{displayProps.amountPrefix}{displayProps.formattedAmount}
		</div>
		<Button
			variant="ghost"
			size="icon"
			onclick={() => transaction.id !== undefined && onDelete(transaction.id)}
			class="shrink-0"
			data-action="delete"
		>
			<Trash2 class="h-4 w-4" />
		</Button>
	</div>
</div>

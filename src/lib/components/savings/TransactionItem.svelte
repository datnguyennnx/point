<script lang="ts">
import type { Transaction } from '$lib/database'
import { Button } from '$lib/components/ui/button'
import { Trash2 } from 'lucide-svelte'
import { formatCurrency } from '$lib/utils/currency'
import { hexToRGBA } from '$lib/utils/color'
import CategoryIcon from '$lib/components/savings/CategoryIcon.svelte'

let { transaction, onDelete } = $props<{
	transaction: Transaction
	onDelete: (id: number) => void
}>()

let backgroundColor = $derived(hexToRGBA(transaction.categoryColor, 0.2))

function capitalizeFirstLetter(val: string) {
	return String(val).charAt(0).toUpperCase() + String(val).slice(1)
}
</script>

<div
	class="flex flex-col items-start justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:gap-0"
	style:background-color={backgroundColor}
>
	<div class="flex w-full items-center gap-1 sm:w-auto">
		<div class="shrink-0 rounded-full p-2">
			<CategoryIcon category={transaction.category} color={transaction.categoryColor} size={20} />
		</div>
		<div class="flex w-full flex-col items-center sm:flex-row sm:space-x-4">
			<p class="font-medium">{capitalizeFirstLetter(transaction.category)}</p>
			<p class="truncate text-sm text-gray-500">{transaction.description}</p>
		</div>
	</div>
	<div class="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
		<div
			class={`${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'} whitespace-nowrap`}
		>
			{transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
		</div>
		<Button
			variant="ghost"
			size="icon"
			onclick={() => transaction.id !== undefined && onDelete(transaction.id)}
			class="shrink-0"
		>
			<Trash2 class="h-4 w-4" />
		</Button>
	</div>
</div>

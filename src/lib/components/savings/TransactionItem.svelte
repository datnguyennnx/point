<script lang="ts">
import type { Transaction } from '$lib/database'
import { Button } from '$lib/components/ui/button'
import { Trash2 } from 'lucide-svelte'
import { formatCurrency } from '$lib/utils/currency'
import { hexToRGBA } from '$lib/utils/color'
import CategoryIcon from '$lib/components/savings/CategoryIcon.svelte'

export let transaction: Transaction
export let onDelete: (id: number) => void

$: backgroundColor = hexToRGBA(transaction.categoryColor, 0.2)

function capitalizeFirstLetter(val: string) {
	return String(val).charAt(0).toUpperCase() + String(val).slice(1)
}
</script>

<div
	class="flex items-center justify-between rounded-lg border p-4"
	style:background-color={backgroundColor}
>
	<div class="flex items-center gap-1">
		<div class="rounded-full p-2">
			<CategoryIcon category={transaction.category} color={transaction.categoryColor} size={20} />
		</div>
		<div class="flex flex-row space-x-4">
			<p>{capitalizeFirstLetter(transaction.category)}</p>
			<p>{transaction.description}</p>
		</div>
	</div>
	<div class="flex items-center gap-4">
		<div class={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
			{transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
		</div>
		<Button
			variant="ghost"
			size="icon"
			onclick={() => transaction.id !== undefined && onDelete(transaction.id)}
		>
			<Trash2 class="h-4 w-4" />
		</Button>
	</div>
</div>

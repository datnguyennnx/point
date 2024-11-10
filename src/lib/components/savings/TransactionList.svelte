<script lang="ts">
import { liveQuery } from 'dexie'
import { savingsdb } from '$lib/database'
import TransactionItem from './TransactionItem.svelte'

export let filter: 'all' | 'income' | 'expense' = 'all'

$: transactions = liveQuery(async () => {
	const allTransactions = await savingsdb.getTransactions()
	if (filter === 'all') return allTransactions
	return allTransactions.filter((t) => t.type === filter)
})

async function handleDelete(id: number) {
	try {
		await savingsdb.deleteTransaction(id)
	} catch (error) {
		console.error('Failed to delete transaction:', error)
	}
}
</script>

<div class="space-y-4">
	{#if $transactions}
		{#if $transactions.length === 0}
			<div class=" py-4 text-center text-muted-foreground">No transactions to show.</div>
		{:else}
			{#each $transactions as transaction (transaction.id)}
				<TransactionItem transaction={transaction} onDelete={handleDelete} />
			{/each}
		{/if}
	{/if}
</div>

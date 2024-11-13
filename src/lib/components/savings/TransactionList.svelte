<script lang="ts">
import { savingsdb } from '$lib/database'
import TransactionItem from './TransactionItem.svelte'
import type { Transaction } from '$lib/database'

let { filter = 'all' } = $props<{
	filter?: 'all' | 'income' | 'expense'
}>()

let transactions = $state<Transaction[]>([])

async function loadTransactions() {
	try {
		const allTransactions = await savingsdb.getTransactions()
		transactions =
			filter === 'all' ? allTransactions : allTransactions.filter((t) => t.type === filter)
	} catch (error) {
		console.error('Failed to load transactions:', error)
		transactions = []
	}
}

async function handleDelete(id: number) {
	try {
		await savingsdb.deleteTransaction(id)
		// Reload transactions after deletion
		await loadTransactions()
	} catch (error) {
		console.error('Failed to delete transaction:', error)
	}
}

// Initial load
$effect(() => {
	loadTransactions()
})

// Reload when filter changes
$effect(() => {
	loadTransactions()
})
</script>

<div class="space-y-4">
	{#if transactions}
		{#if transactions.length === 0}
			<div class="py-4 text-center text-muted-foreground">No transactions to show.</div>
		{:else}
			{#each transactions as transaction (transaction.id)}
				<TransactionItem transaction={transaction} onDelete={handleDelete} />
			{/each}
		{/if}
	{/if}
</div>

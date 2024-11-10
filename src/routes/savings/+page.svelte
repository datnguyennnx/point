<script lang="ts">
import * as Card from '$lib/components/ui/card'
import Canvas from '$lib/components/common/Canvas/Canvas.svelte'
import { liveQuery } from 'dexie'
import { savingsdb } from '$lib/database'
import TransactionInput from '$lib/components/savings/TransactionInput.svelte'
import TransactionList from '$lib/components/savings/TransactionList.svelte'

let filter = $state<'all' | 'income' | 'expense'>('all')

const stats = liveQuery(async () => {
	const balance = await savingsdb.getBalance()
	const transactions = await savingsdb.getTransactions()
	return {
		balance,
		totalIncome: transactions
			.filter((t) => t.type === 'income')
			.reduce((acc, curr) => acc + curr.amount, 0),
		totalExpense: transactions
			.filter((t) => t.type === 'expense')
			.reduce((acc, curr) => acc + curr.amount, 0),
	}
})
</script>

<Canvas>
	<Card.Root>
		<Card.Header>
			<Card.Title>Wallet Manager</Card.Title>
			<Card.Description>Track your income and expenses</Card.Description>
		</Card.Header>

		<Card.Content class="space-y-4">
			<div class="grid grid-cols-3 gap-4">
				<div class="text-center">
					<div class="text-sm text-muted-foreground">Balance</div>
					<div class="text-2xl font-bold">
						${$stats?.balance ?? 0}
					</div>
				</div>
				<div class="text-center">
					<div class="text-sm text-muted-foreground">Income</div>
					<div class="text-2xl font-bold text-green-500">
						${$stats?.totalIncome ?? 0}
					</div>
				</div>
				<div class="text-center">
					<div class="text-sm text-muted-foreground">Expenses</div>
					<div class="text-2xl font-bold text-red-500">
						${$stats?.totalExpense ?? 0}
					</div>
				</div>
			</div>

			<TransactionInput />
			<TransactionList filter={filter} />
		</Card.Content>
	</Card.Root>
</Canvas>

<script lang="ts">
import { ShoppingBag, Coins, Utensils, Car, MoreHorizontal } from 'lucide-svelte'
export let category: string
export let color: string = '#000000'
export let size: number = 16

const icons = {
	shopping: ShoppingBag,
	currency: Coins,
	eating: Utensils,
	car: Car,
	other: MoreHorizontal,
}
$: Icon = icons[category as keyof typeof icons]
</script>

{#if Icon}
	<Icon color={color} size={size} />
{/if}

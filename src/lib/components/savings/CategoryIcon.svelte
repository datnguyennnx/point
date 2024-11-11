<script lang="ts">
import { ShoppingBag, Coins, Utensils, Car, MoreHorizontal } from 'lucide-svelte'

let {
	category,
	color = '#000000',
	size = 16,
} = $props<{
	category: string
	color?: string
	size?: number
}>()

const icons = {
	shopping: ShoppingBag,
	currency: Coins,
	eating: Utensils,
	car: Car,
	other: MoreHorizontal,
}

let Icon = $derived(icons[category as keyof typeof icons])
</script>

{#if Icon}
	<Icon color={color} size={size} />
{/if}

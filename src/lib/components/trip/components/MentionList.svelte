<!-- MentionList.svelte -->

<style>
span {
	transition: all 0.1s ease-in-out;
}
</style>

<script lang="ts">
import type { MentionItem, MentionListRef } from '../types/types'

let isOpen = $state(false)
let items = $state<MentionItem[]>([])
let selectedIndex = $state(0)
// Add these new props
let top = $state(0)
let left = $state(0)

const { items: propItems, command } = $props<{
	items: MentionItem[]
	command: (item: MentionItem) => void
}>()

function selectItem(item: MentionItem): void {
	command(item)
	hide()
}

export function show(): void {
	isOpen = true
}

export function hide(): void {
	isOpen = false
}

export function update(newItems: MentionItem[]): void {
	items = newItems
	selectedIndex = 0 // Reset selection on update
}

export function onKeyDown(event: KeyboardEvent): boolean {
	if (!isOpen) return false

	if (event.key === 'ArrowUp') {
		event.preventDefault()
		selectedIndex = (selectedIndex - 1 + items.length) % items.length
		return true
	}

	if (event.key === 'ArrowDown') {
		event.preventDefault()
		selectedIndex = (selectedIndex + 1) % items.length
		return true
	}

	if (event.key === 'Escape') {
		hide()
	}

	if (event.key === 'Enter') {
		event.preventDefault()
		if (items[selectedIndex]) {
			selectItem(items[selectedIndex])
			return true
		}
	}

	return false
}

export function getSelectedItem(): MentionItem | undefined {
	return items[selectedIndex]
}

export function updatePosition(position: { top: number; left: number }): void {
	top = position.top
	left = position.left
}

interface FormattedLocation {
	text: string
	isMatch: boolean
}

function formatLocationLabel(item: MentionItem): FormattedLocation[] {
	if (!item.location?.formattedAddress) {
		return [
			{
				text: item.label,
				isMatch: false,
			},
		]
	}

	const address = item.location.formattedAddress
	const searchTerm = item.label.toLowerCase()
	const addressLower = address.toLowerCase()

	// If no match found, return the whole address
	if (!addressLower.includes(searchTerm)) {
		return [
			{
				text: address,
				isMatch: false,
			},
		]
	}

	const index = addressLower.indexOf(searchTerm)
	const parts: FormattedLocation[] = []

	// Add text before match
	if (index > 0) {
		parts.push({
			text: address.slice(0, index),
			isMatch: false,
		})
	}

	// Add matching text
	parts.push({
		text: address.slice(index, index + searchTerm.length),
		isMatch: true,
	})

	// Add text after match
	if (index + searchTerm.length < address.length) {
		parts.push({
			text: address.slice(index + searchTerm.length),
			isMatch: false,
		})
	}

	return parts
}
</script>

<div
	class="fixed z-50 max-h-[300px] w-full max-w-sm overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
	style="top: {top}px; left: {left}px"
	class:hidden={!isOpen}
	role="listbox"
	tabindex="0"
	onkeydown={onKeyDown}
>
	{#if items.length === 0}
		<div class="px-4 py-3 text-sm text-gray-500">No locations found.</div>
	{:else}
		{#each items as item, index}
			<button
				class="relative w-full cursor-pointer select-none px-4 py-2.5 text-left text-sm transition-colors duration-150 ease-in-out hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
				class:bg-blue-100={index === selectedIndex}
				class:text-blue-900={index === selectedIndex}
				role="option"
				aria-selected={index === selectedIndex}
				onclick={() => selectItem(item)}
			>
				<span class="block font-normal">
					{#each formatLocationLabel(item) as part}
						<span
							class:font-medium={part.isMatch}
							class:text-blue-600={part.isMatch}
							class="transition-colors duration-150"
						>
							{part.text}
						</span>
					{/each}
				</span>
			</button>
		{/each}
	{/if}
</div>

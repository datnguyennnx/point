<!-- MentionList.svelte -->
<script lang="ts">
import type { MentionItem } from '../types/types'

interface FormattedLocationPart {
	text: string
	isMatch: boolean
}

// Props
const { items: rawItems, command } = $props<{
	items: MentionItem[]
	command: (item: MentionItem) => void
}>()

// State
let isOpen = $state(false)
let selectedIndex = $state(0)
let top = $state(0)
let left = $state(0)

// Derived state for formatted items - recalculates only when rawItems changes
const items = $derived(
	rawItems.map((item: MentionItem) => ({
		// Explicitly type 'item' here
		...item,
		formattedParts: createFormattedLabelParts(item, item.label), // Pass original query label for matching
	})),
)

// --- Exported API for bind:this ---
export function show(): void {
	isOpen = true
	selectedIndex = 0 // Reset index when showing
}

export function hide(): void {
	isOpen = false
}

// Update function is no longer needed externally as items are derived from props
// export function update(newItems: MentionItem[]): void { ... }

export function updatePosition(position: { top: number; left: number }): void {
	top = position.top
	left = position.left
}

export function onKeyDown(event: KeyboardEvent): boolean {
	if (!isOpen || items.length === 0) return false

	switch (event.key) {
		case 'ArrowUp':
			event.preventDefault()
			selectedIndex = (selectedIndex - 1 + items.length) % items.length
			return true
		case 'ArrowDown':
			event.preventDefault()
			selectedIndex = (selectedIndex + 1) % items.length
			return true
		case 'Enter':
			event.preventDefault()
			selectItem(items[selectedIndex])
			return true
		case 'Escape':
			event.preventDefault() // Prevent closing modals etc.
			hide()
			return true // Indicate we handled the key
		default:
			return false // Let Tiptap handle other keys
	}
}
// --- End Exported API ---

function selectItem(item: MentionItem): void {
	command(item)
	hide() // Hide after selection
}

// Helper to format label parts for highlighting
function createFormattedLabelParts(item: MentionItem, searchTerm: string): FormattedLocationPart[] {
	const address = item.location?.formattedAddress ?? item.label // Fallback to label if no address
	const normalizedSearchTerm = searchTerm.toLowerCase().trim()
	const addressLower = address.toLowerCase()
	const parts: FormattedLocationPart[] = []

	if (!normalizedSearchTerm || !address) {
		return [{ text: address || item.label, isMatch: false }]
	}

	let lastIndex = 0
	let index = addressLower.indexOf(normalizedSearchTerm, lastIndex)

	if (index === -1) {
		// No match found, return the whole address as non-matching
		return [{ text: address, isMatch: false }]
	}

	while (index !== -1) {
		// Add text before the match
		if (index > lastIndex) {
			parts.push({ text: address.slice(lastIndex, index), isMatch: false })
		}
		// Add the matching text
		const matchEndIndex = index + normalizedSearchTerm.length
		parts.push({ text: address.slice(index, matchEndIndex), isMatch: true })

		lastIndex = matchEndIndex
		// Find the next occurrence
		index = addressLower.indexOf(normalizedSearchTerm, lastIndex)
	}

	// Add any remaining text after the last match
	if (lastIndex < address.length) {
		parts.push({ text: address.slice(lastIndex), isMatch: false })
	}

	return parts
}

// Effect to reset index if items change externally (e.g., new search results)
$effect(() => {
	// Check if selectedIndex is out of bounds after items update
	if (selectedIndex >= items.length) {
		selectedIndex = Math.max(0, items.length - 1) // Adjust to last item or 0 if empty
	}
})
</script>

<!-- Using Tailwind classes from Shadcn UI conventions -->
<div
	class:hidden={!isOpen || items.length === 0}
	class="fixed z-50 max-h-[300px] w-full max-w-xs overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
	style="top: {top}px; left: {left}px;"
	role="listbox"
	aria-label="Location suggestions"
>
	{#if items.length === 0 && isOpen}
		<!-- Show only if explicitly opened but no items -->
		<div class="p-2 text-sm text-muted-foreground">No locations found.</div>
	{:else}
		{#each items as item, index (item.id)}
			{@const isSelected = index === selectedIndex}
			<button
				type="button"
				role="option"
				aria-selected={isSelected}
				class="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
				class:bg-accent={isSelected}
				class:text-accent-foreground={isSelected}
				onclick={() => selectItem(item)}
				onmouseenter={() => (selectedIndex = index)}
			>
				<span class="block truncate">
					{#each item.formattedParts as part (part.text + part.isMatch)}
						<span class:font-semibold={part.isMatch} class:text-primary={part.isMatch}>
							{part.text}
						</span>
					{/each}
				</span>
			</button>
		{/each}
	{/if}
</div>

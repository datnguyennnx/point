<script lang="ts">
import type { WithElementRef, WithoutChildren } from 'bits-ui'
import type { HTMLTextareaAttributes } from 'svelte/elements'
import { cn } from '$lib/utils'
import { Check, Copy } from 'lucide-svelte'
interface TextareaProps extends WithoutChildren<WithElementRef<HTMLTextareaAttributes>> {
	ref?: HTMLTextAreaElement | null
	showCopyButton?: boolean
	readonly?: boolean
}
let {
	ref = $bindable<HTMLTextAreaElement | null>(null),
	value = $bindable<string>(''),
	showCopyButton = $bindable(false),
	readonly = $bindable(false),
	class: className,
	...restProps
}: TextareaProps = $props()
let height = $state('auto')
let isCopied = $state(false)
let copyTimeout = $state<ReturnType<typeof setTimeout> | undefined>(undefined)

function adjustHeight(element: HTMLTextAreaElement | null) {
	if (!element) return

	// Reset height to auto first
	element.style.height = 'auto'

	// Set to scrollHeight to get the real height
	const newHeight = `${element.scrollHeight}px`
	element.style.height = newHeight
	height = newHeight
}

// Handle input events to adjust height
function handleInput(event: Event) {
	const textarea = event.currentTarget as HTMLTextAreaElement
	adjustHeight(textarea)
}

// Effect for initial and reactive height adjustment
$effect(() => {
	if (ref && value !== undefined) {
		// Use setTimeout to ensure DOM is updated
		setTimeout(() => adjustHeight(ref), 0)
	}
})

// Copy functionality
async function copyToClipboard() {
	if (!value) return
	try {
		await navigator.clipboard.writeText(value.toString())
		isCopied = true
		if (copyTimeout) clearTimeout(copyTimeout)
		copyTimeout = setTimeout(() => {
			isCopied = false
		}, 2000)
	} catch (err) {
		console.error('Failed to copy text:', err)
	}
}

$effect(() => {
	return () => {
		if (copyTimeout) clearTimeout(copyTimeout)
	}
})
</script>

<div class="relative w-full">
	<textarea
		bind:this={ref}
		bind:value={value}
		readonly={readonly}
		style:height={height}
		oninput={handleInput}
		class={cn(
			'no-scrollbar flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
			readonly && 'cursor-default bg-muted',
			className,
		)}
		{...restProps}
	></textarea>
	{#if showCopyButton}
		<button
			type="button"
			class="absolute right-2 top-2 rounded-md p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
			onclick={copyToClipboard}
			title="Copy to clipboard"
		>
			{#if isCopied}
				<Check class="h-4 w-4 text-green-600" />
			{:else}
				<Copy class="h-4 w-4 text-gray-500" />
			{/if}
		</button>
	{/if}
</div>

<script lang="ts">
	import type { WithElementRef, WithoutChildren } from 'bits-ui'
	import type { HTMLTextareaAttributes } from 'svelte/elements'
	import { cn } from '$lib/utils.js'

	interface TextareaProps extends WithoutChildren<WithElementRef<HTMLTextareaAttributes>> {
		ref?: HTMLTextAreaElement | null
	}

	let {
		ref = $bindable<HTMLTextAreaElement | null>(null),
		value = $bindable(),
		class: className,
		...restProps
	}: TextareaProps = $props()

	// Function to adjust height
	function adjustHeight(element: HTMLTextAreaElement | null) {
		if (!element) return
		// Reset height to auto first to get the correct scrollHeight
		element.style.height = 'auto'
		// Set the height to match the content
		element.style.height = `${element.scrollHeight}px`
	}

	// Handle input events to adjust height
	function handleInput(event: Event) {
		const textarea = event.currentTarget as HTMLTextAreaElement
		adjustHeight(textarea)
	}

	// Use $effect for reactive updates
	$effect(() => {
		if (ref && value !== undefined) {
			adjustHeight(ref)
		}
	})
</script>

<textarea
	bind:this={ref}
	bind:value
	oninput={handleInput}
	class={cn(
		'border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border bg-transparent px-3 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50',
		className,
	)}
	{...restProps}
></textarea>

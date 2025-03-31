<!-- TextEditor.svelte -->
<script lang="ts">
// --- Start of Refactored Script ---
import { onMount, onDestroy } from 'svelte'
import StarterKit from '@tiptap/starter-kit'
import { Editor } from '@tiptap/core'
import Highlight from '@tiptap/extension-highlight'
import type { EditorView } from '@tiptap/pm/view'

import MentionList from './MentionList.svelte'
import type {
	MentionItem,
	SuggestionHandlerProps,
	SuggestionKeyboardHandlerProps,
	SuggestionRenderHandlers,
} from '../types/types'
import {
	CustomMention,
	handleMentionCommand,
	debouncedLocationSearch,
} from '../plugins/mention-plugin'

interface UsedMentionListExports {
	show: () => void
	hide: () => void
	updatePosition: (position: { top: number; left: number }) => void
	onKeyDown: (event: KeyboardEvent) => boolean
}

const { addMarker } = $props<{
	addMarker: (marker: { lngLat: [number, number]; label: string; name: string }) => void
}>()

let editor = $state<Editor | null>(null)
// Renaming back to 'element' to match the restored HTML structure
let element = $state<HTMLDivElement | undefined>()
let mentionListRef = $state<UsedMentionListExports | null>(null)
// Renaming back to 'items' to match the restored HTML structure's MentionList props
let items = $state<MentionItem[]>([])

// Renaming back to 'onMentionCommand' to match the restored HTML structure's MentionList props
function onMentionCommand(item: MentionItem) {
	if (!editor?.view) return
	const { state, dispatch } = editor.view
	handleMentionCommand(state, dispatch, item, editor)

	if (item.location) {
		addMarker({
			lngLat: [item.location.longitude, item.location.latitude],
			label: item.label,
			name: item.location.formattedAddress || item.label,
		})
	}
}

function updateMentionPopupPosition(view: EditorView) {
	if (!mentionListRef) return
	const { from } = view.state.selection
	const coords = view.coordsAtPos(from)
	mentionListRef.updatePosition({
		top: coords.bottom + window.scrollY,
		left: coords.left + window.scrollX,
	})
}

const suggestionConfig = {
	items: async ({ query }: { query: string }): Promise<MentionItem[]> => {
		if (query.length < 2) {
			items = [] // Update 'items' state
			return []
		}
		const results = await debouncedLocationSearch(query)
		items = results // Update 'items' state
		return results
	},
	render: (): SuggestionRenderHandlers => {
		return {
			onStart: () => {
				const currentView = editor?.view
				if (!currentView) return
				// items state is updated by the items() function above
				mentionListRef?.show()
				updateMentionPopupPosition(currentView)
			},
			onUpdate: () => {
				const currentView = editor?.view
				if (!currentView) return
				// items state is updated by the items() function above
				mentionListRef?.show()
				updateMentionPopupPosition(currentView)
			},
			onKeyDown: (props: SuggestionKeyboardHandlerProps): boolean => {
				return mentionListRef?.onKeyDown(props.event) ?? false
			},
			onExit: () => {
				mentionListRef?.hide()
				items = [] // Clear 'items' state
			},
		}
	},
}

onMount(() => {
	// Ensure 'element' (matching the restored HTML) is used
	if (!element) return

	editor = new Editor({
		element: element, // Use 'element' here
		editorProps: {
			attributes: {
				// Keeping the prose classes as they style the editor content area itself
				class:
					'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg focus:outline-none min-w-full h-full',
				role: 'textbox',
				'aria-multiline': 'true',
				'aria-label': 'Trip description editor',
				// Add placeholder via editorProps if needed, or keep using CSS ::before
				// placeholder: 'Describe your trip, use @ to mention locations...',
			},
		},
		extensions: [
			StarterKit.configure({}),
			Highlight.configure({
				multicolor: true,
			}),
			CustomMention.configure({
				suggestion: suggestionConfig,
			}),
		],
		content: '',
	})
})

onDestroy(() => {
	editor?.destroy()
})
// --- End of Refactored Script ---
</script>

<!-- Restored HTML Structure -->
<div bind:this={element}></div>

<div class="flex h-full w-full flex-col overflow-hidden">
	<div class="h-full w-full overflow-y-auto">
		<!-- This div seems redundant if the editor binds to the one above -->
		<!-- <div class="w-full" bind:this={element}></div> -->
		<div class="editor-wrapper w-full">
			{#if editor}
				<div class="editor-content w-full">
					<!-- Ensure props match the script: items, onMentionCommand -->
					<MentionList bind:this={mentionListRef} items={items} command={onMentionCommand} />
				</div>
			{/if}
		</div>
	</div>
</div>

<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import StarterKit from '@tiptap/starter-kit'
import { Editor } from '@tiptap/core'
import Highlight from '@tiptap/extension-highlight'
import MentionList from './MentionList.svelte'

import type {
	MentionItem,
	MentionListRef,
	SuggestionHandlerProps,
	SuggestionKeyboardHandlerProps,
	SuggestionRenderHandlers,
} from '../types/types'
import {
	CustomMention,
	debouncedLocationSearch,
	handleMentionCommand,
} from '../plugins/mention-plugin'

let editor = $state<Editor | null>(null)
let element = $state<HTMLDivElement>()
let mentionListRef = $state<MentionListRef | null>(null)
let items = $state<MentionItem[]>([])

// Add the missing onMentionCommand function
function onMentionCommand(item: MentionItem) {
	if (editor?.view) {
		const { state, dispatch } = editor.view
		handleMentionCommand(state, dispatch, item, editor) // Pass editor instance
	}
}

function updateMentionPosition() {
	if (editor?.view) {
		const { selection } = editor.view.state
		const { from } = selection
		const coords = editor.view.coordsAtPos(from)
		mentionListRef?.updatePosition({
			top: coords.bottom + 5,
			left: coords.left,
		})
	}
}

onMount(() => {
	editor = new Editor({
		element: element,
		editorProps: {
			attributes: {
				class: 'prose prose-sm focus:outline-none h-full w-full',
			},
		},
		extensions: [
			StarterKit,
			Highlight.configure({
				multicolor: true,
				HTMLAttributes: {
					class: 'mention-highlight',
				},
			}),
			CustomMention.configure({
				suggestion: {
					items: async ({ query }: { query: string }): Promise<MentionItem[]> => {
						if (query.length < 2) return []
						try {
							const results = await debouncedLocationSearch(query)
							items = results // Update the items state
							return results
						} catch (error) {
							console.error('Error fetching locations:', error)
							return []
						}
					},
					render: (): SuggestionRenderHandlers => ({
						onStart: () => {
							mentionListRef?.show()
							updateMentionPosition()
						},
						onUpdate: (props: SuggestionHandlerProps) => {
							mentionListRef?.update(props.items)
							updateMentionPosition()
						},
						onKeyDown: (props: SuggestionKeyboardHandlerProps) => {
							return mentionListRef?.onKeyDown(props.event) ?? false
						},
						onExit: () => {
							mentionListRef?.hide()
						},
					}),
				},
			}),
		],
		content: '',
		onTransaction: () => {
			editor = editor
		},
	})
})

onDestroy(() => {
	if (editor) {
		editor.destroy()
	}
})
</script>

<div bind:this={element}></div>
<div class="editor-wrapper flex h-full w-full flex-col">
	{#if editor}
		<div class="editor-content relative flex-1">
			<MentionList bind:this={mentionListRef} items={items} command={onMentionCommand} />
		</div>
	{/if}
</div>

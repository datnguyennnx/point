<!-- TextEditor.svelte -->

<style>
:global(.ProseMirror) {
	width: 100%;
	min-height: 100px;
}
</style>

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

// Add props interface
const { addMarker } = $props<{
	addMarker: (marker: { lngLat: [number, number]; label: string; name: string }) => void
}>()

let editor = $state<Editor | null>(null)
let element = $state<HTMLDivElement>()
let mentionListRef = $state<MentionListRef | null>(null)
let items = $state<MentionItem[]>([])

function onMentionCommand(item: MentionItem) {
	if (editor?.view) {
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
				class: 'prose focus:outline-none min-w-full',
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

<div class="flex h-full w-full flex-col overflow-hidden">
	<div class="h-full w-full overflow-y-auto">
		<div class="w-full" bind:this={element}></div>
		<div class="editor-wrapper w-full">
			{#if editor}
				<div class="editor-content w-full">
					<MentionList bind:this={mentionListRef} items={items} command={onMentionCommand} />
				</div>
			{/if}
		</div>
	</div>
</div>

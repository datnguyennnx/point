// mention-plugin.ts
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import type { Editor } from '@tiptap/core'
import type { SelectionRange } from '@tiptap/pm/state'
import type { EditorState } from '@tiptap/pm/state'
import type {
	MentionItem,
	SuggestionCommandProps,
	SuggestionKeyboardHandlerProps,
} from '../types/types'
import { GeocodingService } from '../services/geocoding'
import { debounce } from '../utils/debounce'

export const CustomMention = Extension.create({
	name: 'customMention',
	addOptions() {
		return {
			suggestion: {
				char: '@',
				command: ({ editor, range, props }: SuggestionCommandProps) => {
					editor.commands.unsetMark('highlight')
					if (editor.view) {
						const { state, dispatch } = editor.view
						handleMentionCommand(state, dispatch, props as MentionItem, editor)
					}
				},
				items: async ({ query }: { query: string }): Promise<MentionItem[]> => {
					// Allow searching after typing at least 2 characters (including spaces)
					if (normalizeSearchTerm(query).length < 2) return []
					return await debouncedLocationSearch(query)
				},
				keyboardHandler: ({
					event,
					command,
					range,
					props,
					state,
				}: SuggestionKeyboardHandlerProps): boolean => {
					if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter') {
						return true
					}
					return false
				},
			},
		}
	},
	addProseMirrorPlugins() {
		return [
			Suggestion({
				editor: this.editor,
				...this.options.suggestion,
			}),
		]
	},
})

export function handleMentionCommand(
	state: EditorState,
	dispatch: any,
	item: MentionItem,
	editor: Editor,
): void {
	if (!state || !dispatch) return

	// Get current selection
	const { from, to } = state.selection

	// Find the starting position of the @ symbol
	const textBefore = state.doc.textBetween(Math.max(0, from - 50), from)
	const atIndex = textBefore.lastIndexOf('@')
	const start = from - (textBefore.length - atIndex)

	// Create the mention text
	const mentionText = `@${item.label}`
	const mentionEnd = start + mentionText.length

	// Create transaction
	const tr = state.tr
	tr.deleteRange(start, to)
	tr.insertText(mentionText, start)
	dispatch(tr)

	// Apply highlight only to the mention text and explicitly unset it afterwards
	editor
		.chain()
		.focus()
		// First highlight the mention
		.setTextSelection({ from: start, to: mentionEnd })
		.setHighlight({ color: '#e9d5ff' })
		// Move cursor after mention
		.setTextSelection(mentionEnd)
		// Insert space and explicitly unset highlight for future text
		.insertContent(' ')
		.unsetHighlight()
		.run()
}

function normalizeSearchTerm(query: string): string {
	return query.toLowerCase().trim().replace(/\s+/g, ' ') // normalize multiple spaces to single space
}

export const debouncedLocationSearch = debounce(async (query: string) => {
	// Remove the @ symbol and normalize the search term
	const searchTerm = normalizeSearchTerm(query.replace('@', ''))

	if (!searchTerm) return []

	try {
		const locations = await GeocodingService.geocode(searchTerm, {
			preferredService: 'nominatim',
		})

		return locations
			.filter((location) => location.formattedAddress)
			.map((location) => ({
				id: `${location.latitude},${location.longitude}`,
				label: location.formattedAddress || `${location.latitude}, ${location.longitude}`,
				location,
				function: () => {
					console.log('Selected location:', location)
				},
			}))
	} catch (error) {
		console.error('Location search error:', error)
		return []
	}
}, 100)

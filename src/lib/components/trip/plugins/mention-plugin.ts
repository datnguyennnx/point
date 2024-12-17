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
import { OptimizedGeocodingService } from '../services/geocoding'
import { debounce } from '../utils/debounce'

interface MentionState {
	lastQuery: string
	lastResults: MentionItem[]
	isSearching: boolean
}

const mentionState: MentionState = {
	lastQuery: '',
	lastResults: [],
	isSearching: false,
}

export const CustomMention = Extension.create({
	name: 'customMention',

	addOptions() {
		return {
			suggestion: {
				char: '@',
				command: ({ editor, range, props }: SuggestionCommandProps) => {
					if (editor.view) {
						const { state, dispatch } = editor.view
						handleMentionCommand(state, dispatch, props as MentionItem, editor)
					}
				},
				items: async ({ query }: { query: string }): Promise<MentionItem[]> => {
					const normalizedQuery = normalizeSearchTerm(query)

					// Return cached results if query hasn't changed
					if (normalizedQuery === mentionState.lastQuery && mentionState.lastResults.length > 0) {
						return mentionState.lastResults
					}

					// Minimum query length check
					if (normalizedQuery.length < 2) {
						mentionState.lastResults = []
						return []
					}

					// Prevent concurrent searches
					if (mentionState.isSearching) {
						return mentionState.lastResults
					}

					try {
						mentionState.isSearching = true
						const results = await debouncedLocationSearch(query)
						mentionState.lastQuery = normalizedQuery
						mentionState.lastResults = results
						return results
					} finally {
						mentionState.isSearching = false
					}
				},
				keyboardHandler: ({
					event,
					command,
					range,
					props,
					state,
				}: SuggestionKeyboardHandlerProps): boolean => {
					const isNavigationKey = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(event.key)
					if (isNavigationKey) {
						event.preventDefault()
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

	try {
		const { from, to } = state.selection
		const textBefore = state.doc.textBetween(Math.max(0, from - 50), from)
		const atIndex = textBefore.lastIndexOf('@')

		if (atIndex === -1) return

		const start = from - (textBefore.length - atIndex)
		const mentionText = `@${item.label}`
		const mentionEnd = start + mentionText.length

		// Create and dispatch transaction
		const tr = state.tr.deleteRange(start, to).insertText(mentionText, start)

		dispatch(tr)

		// Apply highlighting and formatting
		editor
			.chain()
			.focus()
			.setTextSelection({ from: start, to: mentionEnd })
			.setHighlight({ color: '#e9d5ff' })
			.setTextSelection(mentionEnd)
			.insertContent(' ')
			.unsetHighlight()
			.run()
	} catch (error) {
		console.error('Error handling mention command:', error)
		// Implement fallback behavior if needed
	}
}

function normalizeSearchTerm(query: string): string {
	return query.replace('@', '').toLowerCase().trim().replace(/\s+/g, ' ')
}

// Optimized debounced search with error handling and retry logic
export const debouncedLocationSearch = debounce(async (query: string): Promise<MentionItem[]> => {
	const searchTerm = normalizeSearchTerm(query)
	if (!searchTerm) return []

	try {
		const locations = await OptimizedGeocodingService.geocode(searchTerm, {
			preferredService: 'nominatim',
			timeout: 3000, // 3 second timeout
		})

		return locations
			.filter((location) => location.formattedAddress && location.confidence > 0.3)
			.map((location) => ({
				id: `${location.latitude},${location.longitude}`,
				label: location.formattedAddress || `${location.latitude}, ${location.longitude}`,
				location,
				confidence: location.confidence,
				metadata: location.metadata,
				function: () => {
					handleLocationSelection(location)
				},
			}))
			.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
			.slice(0, 5) // Limit to top 5 results
	} catch (error) {
		console.error('Location search error:', error)
		return []
	}
}, 250) // Increased debounce time for better performance

// Helper functions
function handleLocationSelection(location: any): void {
	console.log('Selected location:', location)
}

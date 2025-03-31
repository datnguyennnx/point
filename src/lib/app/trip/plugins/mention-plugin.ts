// mention-plugin.ts
import { OptimizedGeocodingService } from '../services/geocoding'
import { debounce } from '../utils/debounce'
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import type {
	MentionItem,
	SuggestionCommandProps,
	// SuggestionKeyboardHandlerProps, // No longer needed here
} from '../types/types'
import type { Editor } from '@tiptap/core'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import { PluginKey } from '@tiptap/pm/state'

// Define a PluginKey for potential future state management within the plugin itself
export const MentionPluginKey = new PluginKey('mention')

interface MentionState {
	lastQuery: string
	lastResults: MentionItem[]
	isSearching: boolean
}

// Simple cache state (consider instance-specific state if multiple editors needed)
const mentionState: MentionState = {
	lastQuery: '',
	lastResults: [],
	isSearching: false,
}

function normalizeSearchTerm(query: string): string {
	// Keep the original logic, seems fine
	return query.replace('@', '').toLowerCase().trim().replace(/\s+/g, ' ')
}

export const debouncedLocationSearch = debounce(async (query: string): Promise<MentionItem[]> => {
	const searchTerm = normalizeSearchTerm(query)
	if (searchTerm.length < 2) return [] // Check length after normalization

	// Prevent concurrent searches more robustly
	if (mentionState.isSearching) {
		console.log('Search already in progress for:', mentionState.lastQuery)
		return mentionState.lastResults // Return previous results immediately
	}

	// Return cached results if query hasn't changed significantly
	// (Could add more sophisticated caching/comparison if needed)
	if (searchTerm === mentionState.lastQuery) {
		return mentionState.lastResults
	}

	mentionState.isSearching = true
	mentionState.lastQuery = searchTerm // Update lastQuery immediately

	try {
		console.log('Searching for:', searchTerm)
		const locations = await OptimizedGeocodingService.geocode(searchTerm, {
			timeout: 5000,
			limit: 5,
			types: ['place', 'address', 'poi'],
		})

		const results = locations
			.filter((location) => location.formattedAddress && location.confidence > 0.3)
			.map((location) => ({
				id: `${location.latitude},${location.longitude}`,
				label: location.formattedAddress || `${location.latitude}, ${location.longitude}`,
				location,
				confidence: location.confidence,
				metadata: location.metadata,
			}))
			.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
			.slice(0, 5)

		mentionState.lastResults = results
		console.log('Search results:', results)
		return results
	} catch (error) {
		console.error('Location search error:', error)
		mentionState.lastResults = [] // Clear cache on error
		return []
	} finally {
		mentionState.isSearching = false
	}
}, 250) // Keep debounce time reasonable

export function handleMentionCommand(
	state: EditorState,
	dispatch: (tr: Transaction) => void,
	item: MentionItem,
	editor: Editor,
): void {
	if (!state || !dispatch) return

	try {
		// Determine the range of the text to be replaced (from '@' to cursor)
		const { from, to } = state.selection
		let mentionStart = from
		let foundAt = false
		// Search backwards for the '@' symbol
		state.doc.nodesBetween(Math.max(0, from - 50), from, (node, pos) => {
			if (foundAt) return false // Stop searching once '@' is found
			if (node.isText) {
				const text = node.text ?? ''
				const atIndex = text.lastIndexOf('@')
				if (atIndex !== -1) {
					// Calculate the absolute start position of the mention trigger
					mentionStart = pos + atIndex
					foundAt = true
					return false // Stop searching
				}
			}
			return true // Continue searching
		})

		if (!foundAt) return // '@' not found before cursor

		const mentionText = `@${item.label}` // Use the selected item's label
		const mentionEnd = mentionStart + mentionText.length

		// Create and dispatch transaction to replace the query with the mention
		const tr = state.tr
			.insertText(mentionText, mentionStart, to) // Replace from '@' start to current cursor pos
			.scrollIntoView() // Ensure the mention is visible
		dispatch(tr)

		// Apply highlighting and move cursor after the mention + space
		// Use a separate transaction chain for post-insertion formatting
		editor
			.chain()
			.focus(undefined, { scrollIntoView: false }) // Keep focus, don't scroll again
			.setTextSelection({ from: mentionStart, to: mentionEnd })
			.setHighlight({ color: '#e9d5ff' }) // Use your desired highlight color
			.setTextSelection(mentionEnd) // Move cursor to the end
			.insertContent(' ') // Add a space after the mention
			.unsetHighlight() // Remove highlight from the space and subsequent text
			.run()
	} catch (error) {
		console.error('Error handling mention command:', error)
	}
}

export const CustomMention = Extension.create({
	name: 'customMention',

	addOptions() {
		return {
			suggestion: {
				char: '@',
				pluginKey: MentionPluginKey, // Associate with the plugin key
				// The command is now handled within TextEditor.svelte via the render().onExit/selectItem logic
				// command: ({ editor, props }: SuggestionCommandProps) => { ... }

				// Fetch items using the debounced search
				items: async ({ query }: { query: string }): Promise<MentionItem[]> => {
					// No need for caching logic here, debounced function handles it
					return await debouncedLocationSearch(query)
				},

				// Removed keyboardHandler - it's handled by MentionList via render().onKeyDown
				// keyboardHandler: ({ event }: SuggestionKeyboardHandlerProps): boolean => { ... }

				// Allow spaces in mentions if needed (adjust regex if required)
				allowSpaces: true,

				// Optional: Customize the regex if needed, default usually works
				// regex: /(@\w*)$/,
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

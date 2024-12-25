import type { Editor } from '@tiptap/core'
import type { SelectionRange, EditorState } from '@tiptap/pm/state'

export interface MentionItem {
	id: string
	label: string
	location?: {
		latitude: number
		longitude: number
		formattedAddress?: string
	}
	confidence?: number
	metadata?: any
}
export interface MentionListProps {
	items: MentionItem[]
	command: (item: MentionItem) => void
}

export interface MentionListRef {
	show: () => void
	hide: () => void
	update: (items: MentionItem[]) => void
	onKeyDown: (event: KeyboardEvent) => boolean
	getSelectedItem: () => MentionItem | undefined
	updatePosition: (position: { top: number; left: number }) => void
}
export interface EditorProps {
	content?: string
	editorClass?: string
}

export interface SuggestionHandlerProps {
	query: string
	items: MentionItem[]
	command: (item: MentionItem) => void
	clientRect: DOMRect | null
	decorationNode: Element | null
	event: KeyboardEvent | null
}

export interface SuggestionKeyboardHandlerProps {
	event: KeyboardEvent
	command: (props: MentionItem) => void
	range: SelectionRange
	props: MentionItem
	state: EditorState
}

export interface SuggestionCommandProps {
	editor: Editor
	range: SelectionRange
	props: MentionItem
}

export interface SuggestionRenderHandlers {
	onStart: () => void
	onUpdate: (props: SuggestionHandlerProps) => void
	onKeyDown: (props: SuggestionKeyboardHandlerProps) => boolean
	onExit: () => void
}

export interface MapMarker {
	lngLat: [number, number]
	label: string
	name: string
}

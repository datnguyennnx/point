// tests/unit/morse/components/__test-utils__.ts
import { render, screen } from '@testing-library/svelte/svelte5'
interface TestCase {
	text: string
	morse: string
	expectedText?: string
	expectedMorse?: string
}

export const TEST_CASES: Record<string, TestCase> = {
	SINGLE_WORD: {
		text: 'SOS',
		morse: '... --- ...',
	},
	MULTIPLE_WORDS: {
		text: 'HI THERE',
		morse: '.... .. / - .... . .-. .',
	},
	NUMBERS: {
		text: '123',
		morse: '.---- ..--- ...--',
	},
	MIXED_CASE: {
		text: 'Hello',
		morse: '.... . .-.. .-.. ---',
		expectedText: 'HELLO',
	},
	SPECIAL_CHARS: {
		text: 'HELLO!',
		morse: '.... . .-.. .-.. --- !',
	},
	EXTRA_SPACES: {
		text: ' SOS ',
		morse: '... --- ...',
		expectedText: 'SOS',
		expectedMorse: '... --- ...',
	},
	EMPTY: {
		text: '',
		morse: '',
	},
}

interface TestUtils {
	getTextArea: (testId: string) => HTMLTextAreaElement
	getCopyButton: (container: HTMLElement) => HTMLButtonElement | null
}

export const setupComponent = (component: any): TestUtils => {
	beforeEach(() => {
		render(component as any)
		Object.assign(navigator, {
			clipboard: {
				writeText: vi.fn().mockImplementation(async () => await Promise.resolve()),
			},
		})
	})

	return {
		getTextArea: (testId: string) => screen.getByTestId(testId),
		getCopyButton: (container: HTMLElement) =>
			container.querySelector('button[title="Copy to clipboard"]'),
	}
}

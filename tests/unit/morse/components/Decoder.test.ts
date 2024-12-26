// tests/unit/morse/components/Decoder.test.ts
import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/svelte/svelte5'
import { TEST_CASES, setupComponent } from './__test-utils__'
import Decoder from '$lib/app/morse/components/Decoder.svelte'

describe('Decoder Component (Morse → Text)', () => {
	const { getTextArea, getCopyButton } = setupComponent(Decoder)

	it('should render with correct title and description', () => {
		expect(screen.getByTestId('decoder-title')).toHaveTextContent('Morse Code to Text')
		expect(screen.getByTestId('decoder-description')).toHaveTextContent(
			'Convert Morse code back to text. Use dots (.) and dashes (-), separate letters with spaces.',
		)
	})

	Object.entries(TEST_CASES).forEach(([caseName, testCase]) => {
		it(`should handle ${caseName.toLowerCase().replace('_', ' ')}`, async () => {
			const input = getTextArea('morse-input')
			await fireEvent.input(input, { target: { value: testCase.morse } })

			const expectedOutput = testCase.expectedText ?? testCase.text.toUpperCase()
			expect(getTextArea('text-output')).toHaveValue(expectedOutput)
		})
	})

	// Component-specific features
	describe('Component Features', () => {
		it('should show copy buttons for both textareas', () => {
			const copyButtons = screen.getAllByRole('button', { name: /Copy/i })
			expect(copyButtons).toHaveLength(2)
		})

		it('should copy text when button is clicked', async () => {
			const input = getTextArea('morse-input')
			await fireEvent.input(input, { target: { value: '... --- ...' } })

			const container = input.closest('div')!
			const copyButton = getCopyButton(container)
			await fireEvent.click(copyButton!)

			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('... --- ...')
		})

		it('should ensure output textarea is readonly', () => {
			expect(getTextArea('text-output')).toHaveAttribute('readonly')
		})

		it('should adjust textarea height on input', async () => {
			const input = getTextArea('morse-input')
			const initialHeight = input.style.height

			await fireEvent.input(input, { target: { value: '.... .\n.-.. .-..\n--- ---' } })
			await new Promise((resolve) => setTimeout(resolve, 0))

			expect(input.style.height).not.toBe(initialHeight)
		})
	})
})

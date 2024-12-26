// tests/unit/morse/components/Encoder.test.ts
import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/svelte/svelte5'
import { TEST_CASES, setupComponent } from './__test-utils__'
import Encoder from '$lib/app/morse/components/Encoder.svelte'

describe('Encoder Component (Text → Morse)', () => {
	const { getTextArea, getCopyButton } = setupComponent(Encoder)

	it('should render with correct title and description', () => {
		expect(screen.getByTestId('encoder-title')).toHaveTextContent('Text to Morse Code')
		expect(screen.getByTestId('encoder-description')).toHaveTextContent(
			'Convert your text message into Morse code. Type your message below.',
		)
	})

	Object.entries(TEST_CASES).forEach(([caseName, testCase]) => {
		it(`should handle ${caseName.toLowerCase().replace('_', ' ')}`, async () => {
			const input = getTextArea('text-input')
			await fireEvent.input(input, { target: { value: testCase.text } })

			const expectedOutput = testCase.expectedMorse ?? testCase.morse
			expect(getTextArea('morse-output')).toHaveValue(expectedOutput)
		})
	})

	// Component-specific features
	describe('Component Features', () => {
		it('should show copy buttons for both textareas', () => {
			const copyButtons = screen.getAllByRole('button', { name: /Copy/i })
			expect(copyButtons).toHaveLength(2)
		})

		it('should copy text when button is clicked', async () => {
			const input = getTextArea('text-input')
			await fireEvent.input(input, { target: { value: 'TEST' } })

			const container = input.closest('div')!
			const copyButton = getCopyButton(container)
			await fireEvent.click(copyButton!)

			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('TEST')
		})

		it('should ensure output textarea is readonly', () => {
			expect(getTextArea('morse-output')).toHaveAttribute('readonly')
		})

		it('should adjust textarea height on input', async () => {
			const input = getTextArea('text-input')
			const initialHeight = input.style.height

			await fireEvent.input(input, { target: { value: 'Multiple\nLines\nOf\nText' } })
			await new Promise((resolve) => setTimeout(resolve, 0))

			expect(input.style.height).not.toBe(initialHeight)
		})
	})
})

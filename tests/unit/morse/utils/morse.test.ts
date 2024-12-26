import { describe, it, expect } from 'vitest'
import { morseToText, textToMorse } from '$lib/app/morse/utils/morse'

describe('Morse Code Utils', () => {
	describe('textToMorse', () => {
		it('should convert simple text to morse code', () => {
			expect(textToMorse('SOS')).toBe('... --- ...')
		})

		it('should handle lowercase letters', () => {
			expect(textToMorse('hello')).toBe('.... . .-.. .-.. ---')
		})

		it('should handle spaces', () => {
			expect(textToMorse('HI THERE')).toBe('.... .. / - .... . .-. .')
		})
	})

	describe('morseToText', () => {
		it('should convert morse code to text', () => {
			expect(morseToText('... --- ...')).toBe('SOS')
		})

		it('should handle spaces between words', () => {
			expect(morseToText('.... .. / - .... . .-. .')).toBe('HI THERE')
		})
	})
})

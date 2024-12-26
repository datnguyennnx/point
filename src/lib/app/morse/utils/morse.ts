// src/lib/app/morse/utils/morse.ts
import { MORSE_CODE, REVERSE_MORSE } from '$lib/app/morse/constants/morse'

export function morseToText(morse: string): string {
	return morse
		.split(' ')
		.map((code) => {
			if (!code) return ''
			// If it's a forward slash, return a space
			if (code === '/') return ' '
			// Return the decoded character or the original code if unknown
			return REVERSE_MORSE[code] || code
		})
		.join('')
		.trim()
}

export function textToMorse(text: string): string {
	return text
		.trim()
		.toUpperCase()
		.split('')
		.map((char) => {
			// If it's a space, return forward slash
			if (char === ' ') return '/'
			// Return the morse code or the original character if unknown
			return MORSE_CODE[char] || char
		})
		.join(' ')
		.trim()
}

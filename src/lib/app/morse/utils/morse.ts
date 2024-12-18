// src/lib/utils/morse.ts
import { MORSE_CODE, REVERSE_MORSE } from '$lib/app/morse/constants/morse'

export function textToMorse(text: string): string {
	return text
		.toUpperCase()
		.split('')
		.map((char) => MORSE_CODE[char] || char)
		.join(' ')
}

export function morseToText(morse: string): string {
	return morse
		.split(' ')
		.map((code) => REVERSE_MORSE[code] || code)
		.join('')
}

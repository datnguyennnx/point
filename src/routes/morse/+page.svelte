<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js'
	import { Textarea } from '$lib/components/ui/textarea/index.js'
	import { Label } from '$lib/components/ui/label/index.js'

	let inputMorse = $state('')
	let outputText = $state('')

	// Define Morse code mappings
	const MORSE_CODE: { [key: string]: string } = {
		'.-': 'A',
		'-...': 'B',
		'-.-.': 'C',
		'-..': 'D',
		'.': 'E',
		'..-.': 'F',
		'--.': 'G',
		'....': 'H',
		'..': 'I',
		'.---': 'J',
		'-.-': 'K',
		'.-..': 'L',
		'--': 'M',
		'-.': 'N',
		'---': 'O',
		'.--.': 'P',
		'--.-': 'Q',
		'.-.': 'R',
		'...': 'S',
		'-': 'T',
		'..-': 'U',
		'...-': 'V',
		'.--': 'W',
		'-..-': 'X',
		'-.--': 'Y',
		'--..': 'Z',
		'.----': '1',
		'..---': '2',
		'...--': '3',
		'....-': '4',
		'.....': '5',
		'-....': '6',
		'--...': '7',
		'---..': '8',
		'----.': '9',
		'-----': '0',
		'/': ' ',
		'|': ' ',
	}

	// Define a type for the keys of the MORSE_CODE
	type MorseKey = keyof typeof MORSE_CODE

	function convertMorseToText(morse: string): string {
		const words = morse.trim().split('   ')
		return words
			.map((word) =>
				word
					.split(' ')
					.map((character: string) => {
						// Cast character to MorseKey, ensuring it's a valid key
						return MORSE_CODE[character as MorseKey] || ''
					})
					.join(''),
			)
			.join(' ')
	}

	$effect(() => {
		outputText = convertMorseToText(inputMorse)
	})
</script>

<div class="flex w-full min-h-screen">
	<div class="flex flex-col w-full justify-center items-center">
		<Card.Root class="max-w-[640px]">
			<Card.Header>
				<Card.Title>Morse Convert</Card.Title>
				<Card.Description>
					Morse code is a telecommunications method which encodes text characters as standardized
					sequences of two different signal durations, called dots and dashes, or dits and dahs.
					Morse code is named after Samuel Morse, one of the early developers of the system adopted
					for electrical telegraphy.
				</Card.Description>
			</Card.Header>

			<Card.Content class="space-y-2">
				<Label class="text-md font-bold" for="morse-code">Your Morse Code</Label>
				<Textarea
					bind:value={inputMorse}
					placeholder="Use dots (.) and dashes (-). Separate letters with spaces and words with three spaces."
					id="morse-code"
				/>
			</Card.Content>

			<Card.Content class="space-y-2">
				<Label class="text-md font-bold" for="message">Your message</Label>
				<Textarea value={outputText} readonly placeholder="Your message" id="message" />
			</Card.Content>
		</Card.Root>
	</div>
</div>

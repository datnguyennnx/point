<script lang="ts">
import * as Tabs from '$lib/components/ui/tabs/index.js'
import * as Card from '$lib/components/ui/card/index.js'
import { Textarea } from '$lib/components/ui/textarea/index.js'
import { Label } from '$lib/components/ui/label/index.js'
import Canvas from '$lib/components/common/Canvas/Canvas.svelte'

let textInput = $state('')
let morseInput = $state('')
let morseOutput = $state('')
let textOutput = $state('')

// Define the type for the morse code mapping
type MorseCodeMap = { [key: string]: string }

const MORSE_CODE: MorseCodeMap = {
	A: '.-',
	B: '-...',
	C: '-.-.',
	D: '-..',
	E: '.',
	F: '..-.',
	G: '--.',
	H: '....',
	I: '..',
	J: '.---',
	K: '-.-',
	L: '.-..',
	M: '--',
	N: '-.',
	O: '---',
	P: '.--.',
	Q: '--.-',
	R: '.-.',
	S: '...',
	T: '-',
	U: '..-',
	V: '...-',
	W: '.--',
	X: '-..-',
	Y: '-.--',
	Z: '--..',
	'1': '.----',
	'2': '..---',
	'3': '...--',
	'4': '....-',
	'5': '.....',
	'6': '-....',
	'7': '--...',
	'8': '---..',
	'9': '----.',
	'0': '-----',
	' ': '/',
}

// Create reverse mapping for decoding
const REVERSE_MORSE: MorseCodeMap = Object.fromEntries(
	Object.entries(MORSE_CODE).map(([char, morse]) => [morse, char]),
)

function textToMorse(text: string): string {
	return text
		.toUpperCase()
		.split('')
		.map((char) => MORSE_CODE[char] || char)
		.join(' ')
}

function morseToText(morse: string): string {
	return morse
		.split(' ')
		.map((code) => REVERSE_MORSE[code] || code)
		.join('')
}

$effect(() => {
	morseOutput = textToMorse(textInput)
})

$effect(() => {
	textOutput = morseToText(morseInput)
})
</script>

<Canvas>
	<Tabs.Root value="encode">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="encode">Encoder</Tabs.Trigger>
			<Tabs.Trigger value="decode">Decoder</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="encode">
			<Card.Root>
				<Card.Header>
					<Card.Title>Text to Morse Code</Card.Title>
					<Card.Description>
						Convert your text message into Morse code. Type your message below.
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-2">
						<Label for="text-input">Your Message</Label>
						<Textarea
							showCopyButton={true}
							id="text-input"
							placeholder="Type your message here..."
							bind:value={textInput}
						/>
					</div>
					<div class="space-y-2">
						<Label for="morse-output">Morse Code</Label>
						<Textarea showCopyButton={true} id="morse-output" value={morseOutput} readonly />
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="decode">
			<Card.Root>
				<Card.Header>
					<Card.Title>Morse Code to Text</Card.Title>
					<Card.Description>
						Convert Morse code back to text. Use dots (.) and dashes (-), separate letters with
						spaces.
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-2">
						<Label for="morse-input">Morse Code</Label>
						<Textarea
							showCopyButton={true}
							id="morse-input"
							placeholder="Enter Morse code here..."
							bind:value={morseInput}
						/>
					</div>
					<div class="space-y-2">
						<Label for="text-output">Decoded Message</Label>
						<Textarea showCopyButton={true} id="text-output" value={textOutput} readonly />
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</Canvas>

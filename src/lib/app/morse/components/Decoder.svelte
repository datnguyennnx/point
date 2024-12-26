<!-- /src/lib/app/morse/components/Decoder.svelte -->
<script lang="ts">
import * as Card from '$lib/components/ui/card'
import { Textarea } from '$lib/components/ui/textarea'
import { Label } from '$lib/components/ui/label'
import { morseToText } from '$lib/app/morse/utils/morse'

let morseInput = $state('')
let textOutput = $state('')

$effect(() => {
	textOutput = morseToText(morseInput)
})
</script>

<Card.Root>
	<Card.Header>
		<Card.Title data-testid="decoder-title">Morse Code to Text</Card.Title>
		<Card.Description data-testid="decoder-description">
			Convert Morse code back to text. Use dots (.) and dashes (-), separate letters with spaces.
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="space-y-2">
			<Label for="morse-input">Morse Code</Label>
			<Textarea
				data-testid="morse-input"
				showCopyButton={true}
				id="morse-input"
				aria-label="Your Message"
				placeholder="Enter Morse code here..."
				bind:value={morseInput}
			/>
		</div>
		<div class="space-y-2">
			<Label for="text-output">Decoded Message</Label>
			<Textarea
				data-testid="text-output"
				showCopyButton={true}
				id="text-output"
				value={textOutput}
				readonly
			/>
		</div>
	</Card.Content>
</Card.Root>

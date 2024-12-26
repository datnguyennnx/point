<!-- /src/lib/app/morse/components/Encoder.svelte -->
<script lang="ts">
import * as Card from '$lib/components/ui/card'
import { Textarea } from '$lib/components/ui/textarea'
import { Label } from '$lib/components/ui/label'
import { textToMorse } from '$lib/app/morse/utils/morse'

let textInput = $state('')
let morseOutput = $state('')

$effect(() => {
	morseOutput = textToMorse(textInput)
})
</script>

<Card.Root>
	<Card.Header>
		<Card.Title data-testid="encoder-title">Text to Morse Code</Card.Title>
		<Card.Description data-testid="encoder-description">
			Convert your text message into Morse code. Type your message below.
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="space-y-2">
			<Label for="text-input">Your Message</Label>
			<Textarea
				data-testid="text-input"
				id="text-input"
				aria-label="Your Message"
				placeholder="Type your message here..."
				bind:value={textInput}
				showCopyButton={true}
			/>
		</div>
		<div class="space-y-2">
			<Label for="morse-output">Morse Code</Label>
			<Textarea
				data-testid="morse-output"
				id="morse-output"
				aria-label="Morse Code"
				placeholder="Converted Morse Code will appear here"
				value={morseOutput}
				readonly={true}
				showCopyButton={true}
			/>
		</div>
	</Card.Content>
</Card.Root>

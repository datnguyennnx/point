<script lang="ts">
import * as Card from '$lib/components/ui/card'
import { Textarea } from '$lib/components/ui/textarea'
import { Label } from '$lib/components/ui/label'
import { textToMorse } from '$lib/utils/morse'

let textInput = $state('')
let morseOutput = $state('')

$effect(() => {
	morseOutput = textToMorse(textInput)
})
</script>

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

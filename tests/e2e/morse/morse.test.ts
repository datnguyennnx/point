// tests/e2e/morse/morse.test.ts
import { describe, test, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest'
import { chromium, type Browser, type Page } from 'playwright'

describe('Morse Code Converter', () => {
	let browser: Browser
	let page: Page

	beforeAll(async () => {
		browser = await chromium.launch({
			headless: true, // Use false for debugging
		})
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await browser.newPage()
		await page.goto('http://localhost:1420/morse')
	})

	afterEach(async () => {
		await page.close()
	})

	test('should encode and decode text', async () => {
		// Test encoding
		await page.fill('[id="text-input"]', 'HELLO')
		expect(await page.inputValue('[id="morse-output"]')).toBe('.... . .-.. .-.. ---')

		// Switch to decoder
		await page.click('text=Decoder')

		// Test decoding
		await page.fill('[id="morse-input"]', '.... . .-.. .-.. ---')
		expect(await page.inputValue('[id="text-output"]')).toBe('HELLO')
	})

	test('should handle empty inputs', async () => {
		// Test empty encoding
		await page.fill('[id="text-input"]', '')
		expect(await page.inputValue('[id="morse-output"]')).toBe('')

		// Switch to decoder
		await page.click('text=Decoder')

		// Test empty decoding
		await page.fill('[id="morse-input"]', '')
		expect(await page.inputValue('[id="text-output"]')).toBe('')
	})

	test('should preserve state between tab switches', async () => {
		// Set encoder value
		await page.fill('[id="text-input"]', 'TEST')
		expect(await page.inputValue('[id="morse-output"]')).toBe('- . ... -')

		// Switch to decoder
		await page.click('text=Decoder')

		// Set decoder value
		await page.fill('[id="morse-input"]', '.... ..')
		expect(await page.inputValue('[id="text-output"]')).toBe('HI')

		// Switch back to encoder and verify state is preserved
		await page.click('text=Encoder')
		expect(await page.inputValue('[id="text-input"]')).toBe('TEST')
	})
})

import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { cleanup } from '@testing-library/svelte'
import * as matchers from '@testing-library/jest-dom/matchers'
import { expect } from 'vitest'

// Add custom jest-dom matchers
expect.extend(matchers)

// Mock clipboard API
Object.assign(navigator, {
	clipboard: {
		writeText: vi.fn(),
	},
})

// Cleanup after each test
afterEach(() => {
	cleanup()
	vi.clearAllMocks()
})

import { vi, expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import '@testing-library/jest-dom'

expect.extend(matchers)

// Mock clipboard API
Object.assign(navigator, {
	clipboard: {
		writeText: vi.fn(),
	},
})

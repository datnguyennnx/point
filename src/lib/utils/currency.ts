/**
 * Formats currency with support for different scales and symbols
 * @param value The numeric value to format
 * @param options Optional configuration for formatting
 * @returns Formatted currency string
 */
export function formatCurrency(
	value: number,
	options: {
		currency?: string
		locale?: string
		minimumFractionDigits?: number
		maximumFractionDigits?: number
	} = {},
): string {
	const {
		currency = 'USD',
		locale = 'en-US',
		minimumFractionDigits = 2,
		maximumFractionDigits = 2,
	} = options

	// Handle large numbers with appropriate scaling
	if (Math.abs(value) >= 1_000_000_000) {
		return `${(value / 1_000_000_000).toFixed(1)}B`
	}

	if (Math.abs(value) >= 1_000_000) {
		return `${(value / 1_000_000).toFixed(1)}M`
	}

	if (Math.abs(value) >= 1_000) {
		return `${(value / 1_000).toFixed(1)}K`
	}

	// Standard currency formatting for smaller amounts
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		minimumFractionDigits,
		maximumFractionDigits,
	}).format(value)
}

/**
 * Parses a formatted currency string back to a number
 * @param value The formatted currency string
 * @returns Parsed numeric value
 */
export function parseCurrency(value: string): number {
	// Handle scaled formats
	const scaledMatch = value.match(/^([-+]?\d+(?:\.\d+)?)\s*([KMBT])$/i)
	if (scaledMatch) {
		const [, numStr, scale] = scaledMatch
		const num = parseFloat(numStr)
		switch (scale.toUpperCase()) {
			case 'K':
				return num * 1_000
			case 'M':
				return num * 1_000_000
			case 'B':
				return num * 1_000_000_000
			case 'T':
				return num * 1_000_000_000_000
		}
	}

	// Remove currency symbols and parse
	return parseFloat(
		value
			.replace(/[^\d.-]/g, '') // Remove non-numeric characters
			.replace(/,/g, ''), // Remove commas
	)
}

/**
 * Converts a number to a compact, human-readable format
 * @param value The numeric value to convert
 * @returns Compact string representation
 */
export function compactNumber(value: number): string {
	const absValue = Math.abs(value)
	const sign = value < 0 ? '-' : ''

	if (absValue >= 1_000_000_000) {
		return `${sign}${(absValue / 1_000_000_000).toFixed(1)}B`
	}

	if (absValue >= 1_000_000) {
		return `${sign}${(absValue / 1_000_000).toFixed(1)}M`
	}

	if (absValue >= 1_000) {
		return `${sign}${(absValue / 1_000).toFixed(1)}K`
	}

	return value.toString()
}

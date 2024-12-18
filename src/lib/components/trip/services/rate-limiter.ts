export class RateLimiter {
	private tokens: number
	private lastRefill: number
	private readonly maxTokens: number
	private readonly refillRate: number

	constructor({ maxRequests, timeWindow }: { maxRequests: number; timeWindow: number }) {
		this.maxTokens = maxRequests
		this.refillRate = timeWindow / maxRequests
		this.tokens = maxRequests
		this.lastRefill = Date.now()
	}

	async waitForToken(): Promise<void> {
		this.refillTokens()

		if (this.tokens > 0) {
			this.tokens--
			return
		}

		const waitTime = this.refillRate - (Date.now() - this.lastRefill)
		await new Promise((resolve) => setTimeout(resolve, waitTime))
		return this.waitForToken()
	}

	private refillTokens(): void {
		const now = Date.now()
		const timePassed = now - this.lastRefill
		const refillAmount = Math.floor(timePassed / this.refillRate)

		this.tokens = Math.min(this.maxTokens, this.tokens + refillAmount)
		this.lastRefill = now
	}
}

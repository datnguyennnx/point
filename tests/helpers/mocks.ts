import { vi } from 'vitest'

export const createMockResponse = () => {
	const MockResponse = vi.fn((body?: BodyInit | null, init?: ResponseInit) => {
		return new Response(body, init)
	}) as unknown as typeof Response

	Object.assign(MockResponse, {
		error: vi.fn(() => new Response(null, { status: 500 })),
		json: vi.fn(
			(data: any, init?: ResponseInit) =>
				new Response(JSON.stringify(data), {
					...init,
					headers: { 'Content-Type': 'application/json' },
				}),
		),
		redirect: vi.fn(
			(url: string | URL, status?: number) =>
				new Response(null, {
					status: status || 302,
					headers: { Location: url.toString() },
				}),
		),
	})

	return MockResponse
}

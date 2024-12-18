export function debounce<T extends (...args: any[]) => Promise<any>>(
	fn: T,
	delay: number,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
	let timeoutId: NodeJS.Timeout

	return (...args: Parameters<T>): Promise<ReturnType<T>> => {
		return new Promise((resolve) => {
			clearTimeout(timeoutId)
			timeoutId = setTimeout(async () => {
				resolve(await fn(...args))
			}, delay)
		})
	}
}

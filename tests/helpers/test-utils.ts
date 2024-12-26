import { render } from '@testing-library/svelte'
import { screen } from '@testing-library/dom'

export function renderComponent(Component: any, props = {}) {
	return render(Component, { props })
}

export function getTextArea(label: string): HTMLTextAreaElement {
	return screen.getByLabelText(label) as HTMLTextAreaElement
}

// Additional helper functions
export function getByRole(role: string, options?: { name?: RegExp | string }) {
	return screen.getByRole(role, options)
}

export function getAllByRole(role: string) {
	return screen.getAllByRole(role)
}

export function getByText(text: string | RegExp) {
	return screen.getByText(text)
}

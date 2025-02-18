// src/routes/+layout.ts
export const load = ({ data }) => {
	return {
		session: data.session, // Makes session available to client
	}
}

export const prerender = 'auto'
export const ssr = true

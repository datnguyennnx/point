// src/routes/+layout.server.ts
export const load = async ({ locals }) => {
	return {
		session: locals.session, // Passes session from locals to layout data
	}
}

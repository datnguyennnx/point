// src/hooks.server.ts
import { redirect, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { supabase } from '$lib/supabase'

// src/hooks.server.ts
const sessionHandler: Handle = async ({ event, resolve }) => {
	const {
		data: { session },
	} = await supabase.auth.getSession()
	event.locals.session = session
	return await resolve(event)
}

const authHandler: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url

	// Don't check auth for auth-related paths
	if (pathname.startsWith('/auth/')) {
		return await resolve(event)
	}

	if (!event.locals.session) {
		throw redirect(303, `/auth/login?returnUrl=${pathname}`)
	}

	return await resolve(event)
}

export const handle = sequence(sessionHandler, authHandler)

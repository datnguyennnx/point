// src/routes/auth/callback/+server.ts
import { redirect } from '@sveltejs/kit'
import type { RequestEvent } from '@sveltejs/kit'
import { supabase } from '$lib/supabase'

export async function GET({ url }: RequestEvent) {
	const code = url.searchParams.get('code')

	if (code) {
		await supabase.auth.exchangeCodeForSession(code)
		throw redirect(303, '/')
	}

	throw redirect(303, '/auth/login')
}

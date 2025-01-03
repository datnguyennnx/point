// lib/stores/auth.svelte.ts
import { supabase } from '$lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

class AuthStore {
	private initialized = $state(false)
	session = $state<Session | null>(null)
	user = $state<User | null>(null)
	isAuthenticated = $derived(!!this.session)

	async initAuth() {
		if (this.initialized) return this.session

		const {
			data: { session },
		} = await supabase.auth.getSession()

		if (session?.user) {
			this.session = session
			this.user = this.transformUser(session.user)
		}

		if (!this.initialized) {
			supabase.auth.onAuthStateChange((_event, newSession) => {
				this.session = newSession
				this.user = newSession?.user ? this.transformUser(newSession.user) : null
			})
			this.initialized = true
		}

		return session
	}

	private transformUser(supabaseUser: any): User {
		return {
			...supabaseUser,
			email: supabaseUser.email ?? null,
			user_metadata: {
				...supabaseUser.user_metadata,
				avatar_url: supabaseUser.user_metadata?.avatar_url ?? null,
				name: supabaseUser.user_metadata?.name ?? null,
			},
			app_metadata: {
				...supabaseUser.app_metadata,
				provider: supabaseUser.app_metadata?.provider ?? null,
			},
		} as User
	}

	async signOut() {
		const { error } = await supabase.auth.signOut()
		if (!error) {
			this.session = null
			this.user = null
		}
		return { error }
	}
}

export const auth = new AuthStore()

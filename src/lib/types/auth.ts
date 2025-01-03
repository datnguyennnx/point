// lib/types/auth.ts
import type { Session } from '@supabase/supabase-js'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface AuthState {
	session: Session | null
	user: User | null
	isAuthenticated: boolean
}

export interface SignInCredentials {
	email: string
	password: string
}

export interface AuthError {
	error: Error | null
}

export interface AuthResponse {
	data: {
		session: Session | null
	}
	error: Error | null
}

export interface User extends Omit<SupabaseUser, 'email' | 'user_metadata' | 'app_metadata'> {
	email: string | null // Changed from string | undefined
	user_metadata: {
		avatar_url?: string | null
		name?: string | null
		[key: string]: any
	}
	app_metadata: {
		provider?: string
		[key: string]: any
	}
}

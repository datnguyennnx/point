// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	auth: {
		persistSession: true, // Enable session persistence
		autoRefreshToken: true, // Enable token auto-refresh
		detectSessionInUrl: true, // Enable session detection in URL
	},
})

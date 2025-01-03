// src/app.d.ts
import type { Session } from '@supabase/supabase-js'

declare global {
	namespace App {
		interface Locals {
			session: Session | null
		}
		interface PageData {
			session: Session | null
		}
		// interface Error {}
		// interface Platform {}
	}
}

export {}

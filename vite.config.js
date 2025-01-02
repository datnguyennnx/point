import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [sveltekit()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./tests/setup/vitest.setup.ts'],
		include: ['tests/**/*.{test,spec}.{js,ts}'],
	},
	resolve: process.env.VITEST
		? {
				conditions: ['browser'],
			}
		: undefined,
	optimizeDeps: {
		exclude: ['@electric-sql/pglite'],
	},
	define: {
		'import.meta.env.VERCEL_ANALYTICS_ID': JSON.stringify(process.env.VERCEL_ANALYTICS_ID),
	},
	clearScreen: true,
})

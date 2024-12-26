const config = {
	webServer: {
		command: 'pnpm run build && pnpm run preview',
		port: 1420,
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
}

export default config

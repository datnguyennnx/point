import tsParser from '@typescript-eslint/parser'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginSvelte from 'eslint-plugin-svelte'
import globals from 'globals'
import svelteParser from 'svelte-eslint-parser'
import tsEslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default [
	...tsEslint.configs.recommended,
	...eslintPluginSvelte.configs['flat/recommended'],
	...eslintPluginSvelte.configs['flat/prettier'],
	{
		files: ['**/*.svelte', '*.svelte'],
		plugins: {
			svelte: eslintPluginSvelte,
		},
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				...globals.node,
				...globals.browser,
				...globals.es2017,
				$state: 'readonly',
				$derived: 'readonly',
				$props: 'readonly',
			},
			parser: svelteParser,
			parserOptions: {
				parser: tsParser,
				extraFileExtensions: ['.svelte'],
				svelte: {
					version: 5,
				},
			},
		},
	},
	{
		languageOptions: {
			parserOptions: {
				parser: tsEslint.parser,
				project: true,
				extraFileExtensions: ['.svelte'],
			},
		},
	},
	{
		rules: {
			eqeqeq: ['error', 'always'],
			'func-style': [2, 'declaration'],
			'@typescript-eslint/no-namespace': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
			'no-return-await': 'off',
			'@typescript-eslint/return-await': ['error', 'always'],
			'@typescript-eslint/promise-function-async': 'error',
			'@typescript-eslint/await-thenable': 'error',
			'svelte/no-at-html-tags': 'off',
			'svelte/no-inner-declarations': 'off',
		},
	},
	{
		ignores: [
			'**/.*',
			'.*',
			'**/.DS_Store',
			'**/node_modules',
			'.svelte-kit',
			'**/.env',
			'**/.env.*',
			'!**/.env.example',
			'**/pnpm-lock.yaml',
			'**/package-lock.json',
			'.github',
			'.vscode',
			'.husky',
			'src-tauri',
			'tailwind.config.ts',
			'eslint.config.js',
			'svelte.config.js',
			'postcss.config.js',
			'vite.config.js',
			'**/.pnpm-store',
		],
	},
	eslintConfigPrettier,
]

module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'plugin:cypress/recommended',
		'prettier',
	],
	parserOptions: {
		parser: {
			ts: '@typescript-eslint/parser',
			js: 'espree',
			typescript: '@typescript-eslint/parser',
		},
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte'],
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	plugins: ['@typescript-eslint'],
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
		},
		{
			files: ['tailwind.config.ts'],
			rules: {
				'@typescript-eslint/no-require-imports': 'off',
			},
		},
	],
	rules: {
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				args: 'after-used',
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
			},
		],
		'@typescript-eslint/no-explicit-any': 'warn',
		'no-unused-vars': 'off',
		'react/react-in-jsx-scope': 'off',
		'react/function-component-definition': 'off',
		'no-shadow': 'off',
		'import/extensions': ['off', 'never'],
	},
}

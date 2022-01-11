module.exports = {
	root: true,
	env: {
		node: true,
		webextensions: true,
	},
	extends: ['plugin:vue/base', '@vue/standard'],
	parserOptions: {
		parser: 'babel-eslint',
	},
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'comma-dangle': 0,
		'space-before-function-paren': 0,
		semi: 0,
		indent: [2, 'tab'],
		'no-tabs': 0,
		'dot-notation': 0,
	},
};

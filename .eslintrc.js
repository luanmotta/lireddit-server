
// http://eslint.org/docs/user-guide/configuring

module.exports = {
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  root: true,
  extends: [
    'airbnb-typescript'
  ],
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  // add your custom rules here
  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,

    'no-unused-vars': 1,
    'space-before-function-paren': 0,
    'one-var': 0,
    'curly': 0,
    'no-multi-spaces': 0,
    'key-spacing': 1,
    'standard/no-callback-literal': 0,

    // ES6
    'object-shorthand': 0,
    'prefer-arrow-callback': 0,
    'prefer-const': 2,
    'semi': ['error', 'never'],
    'quotes': ['error', 'single'],
    'prefer-spread': 2,
    'require-await': 2,
    'prefer-rest-params': 1,

    // Others
    'max-classes-per-file': 0,
    'import/prefer-default-export': 0,
    'class-methods-use-this': 0,
    '@typescript-eslint/indent': 0,
    '@typescript-eslint/semi': 0,
    '@typescript-eslint/naming-convention': 0,

    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}

module.exports = {
  extends: [
    'plugin:prettier/recommended',
  ],
  plugins: ['import', 'prettier'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  env: {
    node: true,
    es6: true,
  },
  rules: {
    'eol-last': ['error', 'always'],
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
    'import/extensions': [
      'warn',
      'never',
      { svg: 'always', scss: 'always', json: 'always' },
    ],
    'import/newline-after-import': ['error', { count: 1 }],
    'import/no-duplicates': 'error',
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling']],
        'newlines-between': 'always',
      },
    ],
  },
  settings: {},
}

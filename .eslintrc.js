module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      // Maestro injects `http`/`output`/`json` into flow scripts at runtime; not real globals.
      files: ['e2e/flows/*.js'],
      globals: { http: 'readonly', output: 'writable', json: 'readonly' },
    },
    {
      // The data layer holds no React: it is the cache, freshness policy and
      // application state, consumed by presentation rather than rendering itself.
      // Type-only imports (e.g. react-native event types) are allowed — they
      // vanish at compile time and carry no runtime React dependency.
      files: ['src/data/**/*.ts', 'src/data/**/*.tsx'],
      rules: {
        'no-restricted-imports': 'off',
        '@typescript-eslint/no-restricted-imports': [
          'error',
          {
            paths: [
              { name: 'react', allowTypeImports: true },
              { name: 'react-native', allowTypeImports: true },
            ],
            patterns: [{ group: ['react-native/*'], allowTypeImports: true }],
          },
        ],
      },
    },
  ],
};

module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      // Maestro injects `http`/`output`/`json` into flow scripts at runtime; not real globals.
      files: ['e2e/flows/*.js'],
      globals: { http: 'readonly', output: 'writable', json: 'readonly' },
    },
  ],
};

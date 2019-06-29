module.exports = {
  setupFiles: ['dotenv/config', './globalSetup.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};

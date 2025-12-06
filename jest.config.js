module.exports = {
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  transformIgnorePatterns: ['node_modules/(?!fit-file-parser)'],
  moduleNameMapper: {
    '^node:buffer$': '<rootDir>/node_modules/buffer/index.js'
  },
  testTimeout: 30000, // Allow 30s for integrations tests
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Since Jest 27 'node' env is the default and recommended one.
  // Switch to 'jsdom' to execute test in browser env (was previous behavior until Jest 26)
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      babelConfig: true
    }
  }
};

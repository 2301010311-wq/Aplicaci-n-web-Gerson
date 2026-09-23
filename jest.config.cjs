const base = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
      },
    }],
  },
}

module.exports = {
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!app/**/layout.tsx',
    '!app/**/page.tsx',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  projects: [
    {
      ...base,
      displayName: 'unit',
      roots: ['<rootDir>/__tests__', '<rootDir>/app', '<rootDir>/lib'],
      testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
      testPathIgnorePatterns: ['/node_modules/', '/__tests__/integration/'],
      setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
      testTimeout: 10000,
    },
    {
      ...base,
      displayName: 'integration',
      roots: ['<rootDir>/__tests__/integration', '<rootDir>/app', '<rootDir>/lib'],
      testMatch: ['**/*.int.test.ts'],
      globalSetup: '<rootDir>/__tests__/integration/guard.ts',
      testTimeout: 30000,
    },
  ],
}

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
      },
    }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // C'EST LA LIGNE MAGIQUE
  transformIgnorePatterns: [
    'node_modules/(?!until-async|msw|@mswjs)/'
  ],  
};
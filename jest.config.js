module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    moduleFileExtensions: [
        'ts',
        'js',
        'json'
    ],

    // Handling report generation as a JUnit file
    reporters: [
        'default',
        ['jest-junit', {
            outputDirectory: '.',
            outputName: 'junit.xml',
            classNameTemplate: '{filepath}',
            titleTemplate: '{title}',
            ancestorSeparator: ' › ',
            usePathForSuiteName: true
        }]
    ],

    // Test files patterns
    testMatch: [
        '**/*.test.ts',
        '**/?(*.)+(spec|test).ts',
        '**/tests/unit/**/*.(test|spec).ts',
        '**/tests/integration/**/*.(test|spec).ts'
    ],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },

    // Handling coverage
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/server.ts',
        '!src/migrations/**',
        '!src/seeders/**',
        '!src/**/index.ts',
        '!src/**/*.interface.ts',
        '!src/**/*.enum.ts',
        '!src/**/types.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: [
        'text',
        'lcov',
        'html',
        'cobertura',
        'json-summary'
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/tests/'
    ],
    coverageThreshold: {
        global: {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85
        }
    },

    // Aliases for imports
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@models/(.*)$': '<rootDir>/src/models/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
        '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
        '^@dto/(.*)$': '<rootDir>/src/dto/$1',
        '^@exceptions/(.*)$': '<rootDir>/src/exceptions/$1',
    },

    // test timeout for integration tests
    testTimeout: 30000,

    // Display a detailed report of tests
    verbose: true,

    clearMocks: true,
    restoreMocks: true,
    resetMocks: true,
    maxWorkers: '50%',

    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json'
        }
    }

};
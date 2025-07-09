import {setupTestEnvironment} from "./helpers/test-utils";


beforeAll(() => {
    setupTestEnvironment();
});

// Clean up after each test
afterEach(() => {
    jest.clearAllMocks();
});

// Global test configuration
jest.setTimeout(30000);

// Mock console methods to reduce noise during testing
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
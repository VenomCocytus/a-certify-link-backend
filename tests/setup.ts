import {setupTestEnvironment} from "./helpers/test-utils";
import setTimeout = jest.setTimeout;


beforeAll(() => {
    setupTestEnvironment();
});

// Clean up after each test
afterEach(() => {
    jest.clearAllMocks();
});

// Global test configuration
setTimeout(3000);

// Mock console methods to reduce noise during testing
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
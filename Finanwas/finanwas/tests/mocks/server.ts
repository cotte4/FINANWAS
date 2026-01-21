import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Setup MSW server for testing
 * This intercepts HTTP requests during tests
 */
export const server = setupServer(...handlers);

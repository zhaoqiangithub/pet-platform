import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create the MSW server
export const server = setupServer(...handlers);

// Helper to use in tests
export const startMockServer = () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
};

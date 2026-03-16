import axios from 'axios';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
  })),
  get: jest.fn(),
}));

describe('Map API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('can import axios', () => {
    expect(axios).toBeDefined();
  });

  it('has get method', () => {
    expect(typeof axios.get).toBe('function');
  });
});

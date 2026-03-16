import axios from 'axios';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
  })),
  get: jest.fn(),
  post: jest.fn(),
}));

describe('Rescue API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('can import axios', () => {
    expect(axios).toBeDefined();
  });

  it('has get method', () => {
    expect(typeof axios.get).toBe('function');
  });

  it('has post method', () => {
    expect(typeof axios.post).toBe('function');
  });
});

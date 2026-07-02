import { apiClient } from './api-client';

describe('APIClient', () => {
  beforeEach(() => {
    apiClient.clearToken();
    jest.restoreAllMocks();
  });

  it('handles empty JSON responses without failing', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 204,
      statusText: 'No Content',
      headers: {
        get: () => 'application/json',
      },
      json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected end of JSON input')),
      text: jest.fn().mockResolvedValue(''),
    });

    const result = await apiClient.request('/health');

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });
});

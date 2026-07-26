jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { fetchLegalDocument } from './legalDocument';

const envelope = (data: unknown) => ({
  contractVersion: '1.1',
  data,
  nextChangeAt: null,
  preview: false,
  resolvedContext: {},
});

const jsonResponse = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

test('fetches the legal document by key', async () => {
  const fetchMock = jest.fn().mockResolvedValue(
    jsonResponse(
      envelope({
        title: 'Privacy Notice',
        summary: 'How we handle your data.',
        content: { root: { children: [] } },
      }),
    ),
  );
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  const result = await fetchLegalDocument('privacy-policy');

  const requestedUrl = new URL(fetchMock.mock.calls[0][0]);
  expect(requestedUrl.pathname).toBe('/api/content/v1/legal/privacy-policy');
  expect(result.data.title).toBe('Privacy Notice');
});

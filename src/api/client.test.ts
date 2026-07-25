jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { z } from 'zod';
import { fetchEnvelope } from './client';
import { ApiError } from './apiError';

const dataSchema = z.object({ title: z.string() });
const supported = { major: 1, minor: 1 };

const envelope = (overrides: Record<string, unknown> = {}) => ({
  contractVersion: '1.1',
  data: { title: 'Home' },
  nextChangeAt: null,
  preview: false,
  resolvedContext: {},
  ...overrides,
});

const jsonResponse = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

test('every content request carries all four delivery-context parameters, with platform following the pinned platform', async () => {
  const fetchMock = jest.fn().mockResolvedValue(jsonResponse(envelope()));
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  await fetchEnvelope('/bootstrap', dataSchema, supported);

  const requestedUrl = new URL(fetchMock.mock.calls[0][0]);
  expect(requestedUrl.pathname).toBe('/bootstrap');
  expect(requestedUrl.searchParams.get('platform')).toBe('ios');
  expect(requestedUrl.searchParams.get('market')).toBe('MX');
  expect(requestedUrl.searchParams.get('audience')).toBe('guest');
  expect(requestedUrl.searchParams.get('appVersion')).toBe('1.0.0');
});

test('a compatible minor version renders', async () => {
  globalThis.fetch = jest
    .fn()
    .mockResolvedValue(jsonResponse(envelope({ contractVersion: '1.2' }))) as unknown as typeof fetch;

  const result = await fetchEnvelope('/bootstrap', dataSchema, supported);

  expect(result.data.title).toBe('Home');
});

test('an incompatible major version produces the unsupported-contract state', async () => {
  globalThis.fetch = jest
    .fn()
    .mockResolvedValue(jsonResponse(envelope({ contractVersion: '2.0' }))) as unknown as typeof fetch;

  await expect(fetchEnvelope('/bootstrap', dataSchema, supported)).rejects.toMatchObject({
    kind: 'unsupported-contract',
  });
});

test('tolerates additive fields the contract does not promise', async () => {
  globalThis.fetch = jest
    .fn()
    .mockResolvedValue(jsonResponse(envelope({ future: 'field' }))) as unknown as typeof fetch;

  await expect(fetchEnvelope('/bootstrap', dataSchema, supported)).resolves.toMatchObject({
    contractVersion: '1.1',
  });
});

test('a non-2xx response maps to a user-safe message without leaking status text', async () => {
  globalThis.fetch = jest.fn().mockResolvedValue(jsonResponse({}, 500)) as unknown as typeof fetch;

  await expect(fetchEnvelope('/bootstrap', dataSchema, supported)).rejects.toMatchObject({
    kind: 'http',
    userMessage: expect.stringContaining('try again'),
  });
});

test('malformed JSON maps to a user-safe message', async () => {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => {
      throw new SyntaxError('bad json');
    },
  }) as unknown as typeof fetch;

  await expect(fetchEnvelope('/bootstrap', dataSchema, supported)).rejects.toBeInstanceOf(ApiError);
});

test('a network failure maps to a user-safe message', async () => {
  globalThis.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;

  await expect(fetchEnvelope('/bootstrap', dataSchema, supported)).rejects.toMatchObject({
    kind: 'network',
  });
});

test('never logs the full response payload', async () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  globalThis.fetch = jest.fn().mockResolvedValue(jsonResponse({}, 500)) as unknown as typeof fetch;

  await fetchEnvelope('/bootstrap', dataSchema, supported).catch(() => {});

  const logged = errorSpy.mock.calls.map(call => call.join(' ')).join('\n');
  expect(logged).not.toContain('title');
});

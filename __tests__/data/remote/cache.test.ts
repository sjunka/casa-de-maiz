jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';
import { fetchWithCache } from '@data/remote/cache';

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

beforeEach(async () => {
  jest.restoreAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  await AsyncStorage.clear();
});

test('a successful load followed by a failing request serves saved content marked as such', async () => {
  const fetchMock = jest
    .fn()
    .mockResolvedValueOnce(jsonResponse(envelope()))
    .mockRejectedValueOnce(new Error('offline'));
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  const first = await fetchWithCache('/pages/home', dataSchema, supported);
  expect(first.isSaved).toBe(false);

  const second = await fetchWithCache('/pages/home', dataSchema, supported);
  expect(second.isSaved).toBe(true);
  expect(second.data.title).toBe('Home');
});

test('an entry past its change boundary is withheld in favour of the retry state', async () => {
  const past = new Date(Date.now() - 1000).toISOString();
  const fetchMock = jest
    .fn()
    .mockResolvedValueOnce(jsonResponse(envelope({ nextChangeAt: past })))
    .mockRejectedValueOnce(new Error('offline'));
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  await fetchWithCache('/pages/home', dataSchema, supported);

  await expect(fetchWithCache('/pages/home', dataSchema, supported)).rejects.toMatchObject({
    kind: 'network',
  });
});

test('saved content is not reused across a different delivery context', async () => {
  const fetchMock = jest
    .fn()
    .mockResolvedValueOnce(jsonResponse(envelope()))
    .mockRejectedValueOnce(new Error('offline'));
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  await fetchWithCache('/pages/home', dataSchema, supported);

  await expect(fetchWithCache('/pages/home', dataSchema, { major: 1, minor: 2 })).rejects.toMatchObject({
    kind: 'network',
  });
});

test('an unsupported contract version is not masked by saved content', async () => {
  const fetchMock = jest
    .fn()
    .mockResolvedValueOnce(jsonResponse(envelope()))
    .mockResolvedValueOnce(jsonResponse(envelope({ contractVersion: '2.0' })));
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  await fetchWithCache('/pages/home', dataSchema, supported);

  await expect(fetchWithCache('/pages/home', dataSchema, supported)).rejects.toMatchObject({
    kind: 'unsupported-contract',
  });
});

test('first launch offline with no saved content rejects with the original error', async () => {
  globalThis.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;

  await expect(fetchWithCache('/pages/home', dataSchema, supported)).rejects.toMatchObject({
    kind: 'network',
  });
});

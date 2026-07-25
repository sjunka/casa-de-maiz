/**
 * @format
 */

jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
}));

import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import App from '../App';

const envelope = (overrides: Record<string, unknown> = {}) => ({
  contractVersion: '1.1',
  data: {
    navigation: {
      items: [
        {
          label: 'Home',
          highlighted: true,
          destination: { key: 'home', label: 'Home', path: '/', supportedPlatforms: ['ios', 'android'] },
        },
        {
          label: 'Menu',
          highlighted: false,
          destination: { key: 'menu', label: 'Menu', path: '/menu', supportedPlatforms: ['ios', 'android'] },
        },
      ],
    },
  },
  nextChangeAt: null,
  preview: false,
  resolvedContext: {},
  ...overrides,
});

const homeEnvelope = () => envelope({ data: { layout: [] } });

const jsonResponse = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

test('shows a loading state on launch, then the success state once bootstrap is validated', async () => {
  globalThis.fetch = jest.fn(url =>
    Promise.resolve(
      jsonResponse(String(url).includes('/home') ? homeEnvelope() : envelope()),
    ),
  ) as unknown as typeof fetch;

  await render(<App />);

  expect(screen.getByTestId('bootstrap-loading')).toBeTruthy();

  await waitFor(() => expect(screen.getByTestId('bootstrap-success')).toBeTruthy());
});

test('shows a user-safe error with a working retry when the request fails', async () => {
  let bootstrapCalls = 0;
  const fetchMock = jest.fn(url => {
    if (String(url).includes('/home')) {
      return Promise.resolve(jsonResponse(homeEnvelope()));
    }
    bootstrapCalls += 1;
    return bootstrapCalls === 1
      ? Promise.reject(new Error('offline'))
      : Promise.resolve(jsonResponse(envelope()));
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  await render(<App />);

  await waitFor(() => expect(screen.getByTestId('bootstrap-error')).toBeTruthy());
  expect(screen.queryByText(/server|stack|exception/i)).toBeNull();

  fireEvent.press(screen.getByText('Try again'));

  await waitFor(() => expect(screen.getByTestId('bootstrap-success')).toBeTruthy());
});

test('shows a distinct unsupported-contract state for an incompatible major version, with no retry', async () => {
  globalThis.fetch = jest
    .fn()
    .mockResolvedValue(jsonResponse(envelope({ contractVersion: '2.0' }))) as unknown as typeof fetch;

  await render(<App />);

  await waitFor(() =>
    expect(screen.getByTestId('bootstrap-unsupported-contract')).toBeTruthy(),
  );
  expect(screen.queryByText('Try again')).toBeNull();
});

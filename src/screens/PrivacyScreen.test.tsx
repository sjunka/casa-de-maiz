jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
}));

import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Linking } from 'react-native';
import { PrivacyScreen } from './PrivacyScreen';

const route = { params: { legalKey: 'privacy-policy' } } as never;

const envelope = (data: unknown) => ({
  contractVersion: '1.1',
  data,
  nextChangeAt: null,
  preview: false,
  resolvedContext: {},
});

const jsonResponse = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const renderScreen = async () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <PrivacyScreen route={route} />
      </NavigationContainer>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

test('fetches the legal document by key and renders its title, summary and body', async () => {
  globalThis.fetch = jest.fn().mockResolvedValue(
    jsonResponse(
      envelope({
        title: 'Privacy Notice',
        summary: 'How we handle your data.',
        content: {
          root: {
            children: [{ type: 'paragraph', children: [{ type: 'text', text: 'We respect your privacy.' }] }],
          },
        },
      }),
    ),
  ) as unknown as typeof fetch;

  await renderScreen();

  expect(screen.getByTestId('privacy-loading')).toBeTruthy();

  await waitFor(() => expect(screen.getByText('Privacy Notice')).toBeTruthy());
  expect(screen.getByText('How we handle your data.')).toBeTruthy();
  expect(screen.getByText('We respect your privacy.')).toBeTruthy();
});

test('a failed load shows a retry that works', async () => {
  const fetchMock = jest
    .fn()
    .mockResolvedValueOnce(jsonResponse({}, 500))
    .mockResolvedValueOnce(
      jsonResponse(
        envelope({ title: 'Privacy Notice', content: { root: { children: [] } } }),
      ),
    );
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  await renderScreen();

  await waitFor(() => expect(screen.getByTestId('privacy-error')).toBeTruthy());

  fireEvent.press(screen.getByText('Try again'));

  await waitFor(() => expect(screen.getByText('Privacy Notice')).toBeTruthy());
});

test('an external link opens through Linking after resolving to an https destination', async () => {
  globalThis.fetch = jest.fn().mockResolvedValue(
    jsonResponse(
      envelope({
        title: 'Privacy Notice',
        content: {
          root: {
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'link',
                    fields: { url: 'https://casamaiz.example/terms' },
                    children: [{ type: 'text', text: 'Terms' }],
                  },
                ],
              },
            ],
          },
        },
      }),
    ),
  ) as unknown as typeof fetch;
  jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
  const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as never);

  await renderScreen();

  await waitFor(() => expect(screen.getByText('Terms')).toBeTruthy());
  fireEvent.press(screen.getByText('Terms'));

  await waitFor(() => expect(openURLSpy).toHaveBeenCalledWith('https://casamaiz.example/terms'));
});

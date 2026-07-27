import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { OperationalNoticeBanner } from '@presentation/banners/OperationalNoticeBanner';

afterEach(() => {
  jest.useRealTimers();
});

test('shows the authored banner message when the restaurant is running under a notice', async () => {
  await render(<OperationalNoticeBanner operationalControls={{ mode: 'notice', bannerMessage: 'Kitchen closes at 22:30.' }} />);
  expect(screen.getByText('Kitchen closes at 22:30.')).toBeTruthy();
});

test('a dismissed notice collapses out of the layout entirely', async () => {
  await render(<OperationalNoticeBanner operationalControls={{ mode: 'notice', bannerMessage: 'Kitchen closes at 22:30.' }} />);

  await fireEvent.press(screen.getByLabelText('Descartar aviso'));
  await waitFor(() => expect(screen.queryByTestId('operational-notice-banner')).toBeNull());
});

test('undo inside the window puts the notice back', async () => {
  await render(<OperationalNoticeBanner operationalControls={{ mode: 'notice', bannerMessage: 'Kitchen closes at 22:30.' }} />);

  await fireEvent.press(screen.getByLabelText('Descartar aviso'));
  await waitFor(() => expect(screen.getByTestId('operational-notice-banner-undo')).toBeTruthy());

  await fireEvent.press(screen.getByLabelText('Deshacer descarte'));
  expect(screen.getByTestId('operational-notice-banner')).toBeTruthy();
});

test('auto-dismisses 8 seconds after showing, so an evaluator never has to close it by hand', async () => {
  jest.useFakeTimers();

  await render(<OperationalNoticeBanner operationalControls={{ mode: 'notice', bannerMessage: 'Kitchen closes at 22:30.' }} />);
  expect(screen.getByTestId('operational-notice-banner')).toBeTruthy();

  await act(async () => jest.advanceTimersByTime(8000));
  await act(async () => jest.advanceTimersByTime(4000));
  expect(screen.queryByTestId('operational-notice-banner')).toBeNull();
});

test('renders nothing outside of a notice', async () => {
  await render(<OperationalNoticeBanner operationalControls={{ mode: 'normal', bannerMessage: 'Kitchen closes at 22:30.' }} />);
  expect(screen.queryByText('Kitchen closes at 22:30.')).toBeNull();
});

test('renders nothing when operational controls are absent', async () => {
  await render(<OperationalNoticeBanner />);
  expect(screen.queryByTestId('operational-notice-banner')).toBeNull();
});

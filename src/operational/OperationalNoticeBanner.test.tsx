import { render, screen } from '@testing-library/react-native';
import { OperationalNoticeBanner } from './OperationalNoticeBanner';

test('shows the authored banner message when the restaurant is running under a notice', async () => {
  await render(<OperationalNoticeBanner operationalControls={{ mode: 'notice', bannerMessage: 'Kitchen closes at 22:30.' }} />);
  expect(screen.getByText('Kitchen closes at 22:30.')).toBeTruthy();
});

test('renders nothing outside of a notice', async () => {
  await render(<OperationalNoticeBanner operationalControls={{ mode: 'normal', bannerMessage: 'Kitchen closes at 22:30.' }} />);
  expect(screen.queryByText('Kitchen closes at 22:30.')).toBeNull();
});

test('renders nothing when operational controls are absent', async () => {
  await render(<OperationalNoticeBanner />);
  expect(screen.queryByTestId('operational-notice-banner')).toBeNull();
});

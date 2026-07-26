import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { NoticeCard } from '@presentation/banners/NoticeCard';
import { MIN_TOUCH_TARGET } from '@presentation/theme/tokens';

// The close glyph is deliberately small, so the tap target is the glyph plus
// hitSlop on every side. That sum is what has to clear the platform minimum.
test('the dismiss control is tappable at the platform minimum size', async () => {
  await render(
    <NoticeCard
      icon="update"
      tint="#fff"
      accent="#000"
      message="Update available"
      dismissible
      dismissLabel="Dismiss"
      onDismiss={() => {}}
    />,
  );

  const dismiss = screen.getByLabelText('Dismiss');
  const { width, height } = StyleSheet.flatten(dismiss.props.style) as { width: number; height: number };
  const slop = dismiss.props.hitSlop as number;

  expect(width + slop * 2).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  expect(height + slop * 2).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
});

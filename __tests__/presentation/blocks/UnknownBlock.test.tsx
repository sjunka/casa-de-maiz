import { render, screen } from '@testing-library/react-native';
import { UnknownBlock } from '@presentation/blocks/UnknownBlock';

test('renders a visible marker naming the type in development', async () => {
  await render(<UnknownBlock blockType="newsletterSignup" />);

  expect(screen.getByText(/newsletterSignup/)).toBeTruthy();
});

test('renders nothing in release', async () => {
  const globals = globalThis as unknown as { __DEV__: boolean };
  const originalDev = globals.__DEV__;
  globals.__DEV__ = false;

  try {
    const { toJSON } = await render(<UnknownBlock blockType="newsletterSignup" />);
    expect(toJSON()).toBeNull();
  } finally {
    globals.__DEV__ = originalDev;
  }
});

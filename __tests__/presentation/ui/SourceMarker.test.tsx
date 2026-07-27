import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SourceMarker } from '@presentation/ui/SourceMarker';

test('marks a child once it has real height', async () => {
  await render(
    <SourceMarker source="mock" note="placeholder copy">
      <Text>Hello</Text>
    </SourceMarker>,
  );

  fireEvent(screen.getByTestId('source-marker'), 'layout', { nativeEvent: { layout: { height: 40 } } });

  expect(await screen.findByText('MOCK · placeholder copy')).toBeTruthy();
});

test('a child that renders with no height is left unmarked', async () => {
  await render(
    <SourceMarker source="cms">
      <Text>Hello</Text>
    </SourceMarker>,
  );

  fireEvent(screen.getByTestId('source-marker'), 'layout', { nativeEvent: { layout: { height: 0 } } });

  expect(screen.queryByText('CMS')).toBeNull();
});

test('release builds render children untouched, with no overlay at all', async () => {
  const globals = globalThis as unknown as { __DEV__: boolean };
  const originalDev = globals.__DEV__;
  globals.__DEV__ = false;

  try {
    await render(
      <SourceMarker source="cms">
        <Text>Hello</Text>
      </SourceMarker>,
    );

    expect(screen.getByText('Hello')).toBeTruthy();
    expect(screen.queryByTestId('source-marker')).toBeNull();
  } finally {
    globals.__DEV__ = originalDev;
  }
});

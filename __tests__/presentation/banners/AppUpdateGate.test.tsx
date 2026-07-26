jest.mock('@core/contract/appVersion', () => ({
  getAppVersion: () => '1.0.0',
}));

import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AppUpdateGate } from '@presentation/banners/AppUpdateGate';

test('a recommended update shows a dismissible banner and stays usable', async () => {
  await render(
    <AppUpdateGate appUpdate={{ policy: 'recommended', minimumVersion: '1.5.0', message: 'Update available' }}>
      <Text>App content</Text>
    </AppUpdateGate>,
  );

  expect(screen.getByText('Update available')).toBeTruthy();
  expect(screen.getByText('App content')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('Descartar mensaje de actualización'));
  expect(screen.queryByText('Update available')).toBeNull();
  expect(screen.getByText('App content')).toBeTruthy();
});

test('a required update below the minimum version blocks with an explanation', async () => {
  await render(
    <AppUpdateGate appUpdate={{ policy: 'required', minimumVersion: '1.5.0', message: 'You must update' }}>
      <Text>App content</Text>
    </AppUpdateGate>,
  );

  expect(screen.getByText('You must update')).toBeTruthy();
  expect(screen.queryByText('App content')).toBeNull();
});

test('a minimum version alone, without a required policy, never blocks', async () => {
  await render(
    <AppUpdateGate appUpdate={{ policy: 'recommended', minimumVersion: '1.5.0', message: 'Update available' }}>
      <Text>App content</Text>
    </AppUpdateGate>,
  );

  expect(screen.getByText('App content')).toBeTruthy();
});

import { render, screen } from '@testing-library/react-native';
import { FormFixtureScreen } from '@presentation/screens/FormFixtureScreen';

test('renders the formBlock fixture so the block is reviewable', async () => {
  await render(<FormFixtureScreen />);

  expect(screen.getByLabelText('Nombre')).toBeTruthy();
  expect(screen.getByLabelText('Enviar mensaje')).toBeTruthy();
});

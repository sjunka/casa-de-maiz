/**
 * @format
 */

import { render } from '@testing-library/react-native';
import App from '../App';

test('renders the placeholder screen on launch', async () => {
  const { getByText } = await render(<App />);

  expect(getByText('Casa Maiz')).toBeTruthy();
});

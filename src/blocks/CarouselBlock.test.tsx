import { render, screen, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { CarouselBlock } from './CarouselBlock';
import type { CarouselBlock as CarouselBlockData } from '../models/block';

const block: CarouselBlockData = {
  blockType: 'carousel',
  contractVersion: '1.1',
  channels: ['ios', 'android'],
  slides: [
    { title: 'Slide one', description: 'First' },
    { title: 'Slide two', description: 'Second' },
    { title: 'Slide three', description: 'Third' },
  ],
};

test('paged manually with no autoplay: position only advances on user action', async () => {
  jest.useFakeTimers();

  await render(
    <NavigationContainer>
      <CarouselBlock block={block} />
    </NavigationContainer>,
  );

  expect(screen.getByLabelText('Slide 1 of 3')).toBeTruthy();

  jest.advanceTimersByTime(10000);
  expect(screen.getByLabelText('Slide 1 of 3')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('Next slide'));
  expect(screen.getByLabelText('Slide 2 of 3')).toBeTruthy();

  jest.useRealTimers();
});

test('the previous button is disabled on the first slide and the next button on the last', async () => {
  await render(
    <NavigationContainer>
      <CarouselBlock block={block} />
    </NavigationContainer>,
  );

  expect(screen.getByLabelText('Previous slide').props.accessibilityState?.disabled).toBe(true);

  await fireEvent.press(screen.getByLabelText('Next slide'));
  await fireEvent.press(screen.getByLabelText('Next slide'));

  expect(screen.getByLabelText('Next slide').props.accessibilityState?.disabled).toBe(true);
});

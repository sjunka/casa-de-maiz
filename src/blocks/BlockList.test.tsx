import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BlockList } from './BlockList';
import type { BlockEnvelope } from '../models/block';

const realHomePayload: BlockEnvelope[] = [
  {
    blockType: 'cardGrid',
    contractVersion: '1.1',
    channels: ['ios', 'android'],
    cards: [
      { title: 'Tacos al pastor', description: 'Slow-roasted pork, pineapple, cilantro' },
      { title: 'Elote', description: 'Grilled corn, mayo, cotija' },
    ],
  },
  {
    blockType: 'carousel',
    contractVersion: '1.1',
    channels: ['ios', 'android'],
    slides: [
      { title: 'Nueva temporada', description: 'Platillos de otoño' },
      { title: 'Fin de semana', description: 'Musica en vivo' },
    ],
  },
  {
    blockType: 'promoRail',
    contractVersion: '1.1',
    channels: ['ios', 'android'],
    heading: 'Promociones',
    promotions: [{ title: '2x1 Margaritas', description: 'Todos los martes' }],
  },
  {
    blockType: 'textBlock',
    contractVersion: '1.1',
    channels: ['ios', 'android'],
    heading: 'Nuestra historia',
    body: 'Casa Maiz nacio en el corazon de la ciudad hace veinte años.',
  },
  {
    blockType: 'restaurantCTA',
    contractVersion: '1.1',
    channels: ['ios', 'android'],
    heading: 'Reserva tu mesa',
    description: 'Vive la experiencia Casa Maiz',
    buttonLabel: 'Reservar ahora',
    destination: '/reservas',
  },
];

test('a real Home payload renders every block type in order with its authored content', async () => {
  await render(
    <NavigationContainer>
      <BlockList layout={realHomePayload} />
    </NavigationContainer>,
  );

  expect(screen.getByText('Tacos al pastor')).toBeTruthy();
  expect(screen.getByText('Elote')).toBeTruthy();
  expect(screen.getByText('Nueva temporada')).toBeTruthy();
  expect(screen.getByText('Promociones')).toBeTruthy();
  expect(screen.getByText('2x1 Margaritas')).toBeTruthy();
  expect(screen.getByText('Nuestra historia')).toBeTruthy();
  expect(screen.getByText(/Casa Maiz nacio/)).toBeTruthy();
  expect(screen.getByText('Reservar ahora')).toBeTruthy();
});

test('a layout with an unknown block type renders the rest of the page, logs only the type, and does not throw', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  const layout: BlockEnvelope[] = [
    { blockType: 'textBlock', contractVersion: '1.1', channels: ['ios', 'android'], body: 'Antes' },
    { blockType: 'newsletterSignup', contractVersion: '1.1', channels: ['ios', 'android'] },
    { blockType: 'textBlock', contractVersion: '1.1', channels: ['ios', 'android'], body: 'Despues' },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  expect(screen.getByText('Antes')).toBeTruthy();
  expect(screen.getByText('Despues')).toBeTruthy();
  expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('newsletterSignup'));
});

test('an unknown block type renders a visible marker in development', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  const layout: BlockEnvelope[] = [
    { blockType: 'newsletterSignup', contractVersion: '1.1', channels: ['ios', 'android'] },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  expect(screen.getByText(/newsletterSignup/)).toBeTruthy();
});

test('a block declaring an unsupported contract version is skipped while the rest of the page renders', async () => {
  const layout: BlockEnvelope[] = [
    { blockType: 'textBlock', contractVersion: '2.0', channels: ['ios', 'android'], body: 'Incompatible' },
    { blockType: 'textBlock', contractVersion: '1.1', channels: ['ios', 'android'], body: 'Compatible' },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  expect(screen.queryByText('Incompatible')).toBeNull();
  expect(screen.getByText('Compatible')).toBeTruthy();
});

test('a block whose channels exclude the running platform is skipped', async () => {
  const layout: BlockEnvelope[] = [
    { blockType: 'textBlock', contractVersion: '1.1', channels: ['android'], body: 'Android only' },
    { blockType: 'textBlock', contractVersion: '1.1', channels: ['ios', 'android'], body: 'Both' },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  expect(screen.queryByText('Android only')).toBeNull();
  expect(screen.getByText('Both')).toBeTruthy();
});

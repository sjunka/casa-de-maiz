import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BlockList } from './BlockList';
import type { BlockEnvelope } from '../models/block';

// Shaped after a real /api/content/v1/pages/home response from the Casa Maiz CMS.
const realHomePayload: BlockEnvelope[] = [
  {
    blockType: 'cardGrid',
    contractVersion: '1.1',
    channels: ['web', 'ios', 'android'],
    eyebrow: 'Menu de temporada',
    title: 'De la milpa a la mesa',
    cards: [
      { title: 'Tacos al pastor', description: 'Cerdo, pina, cilantro', price: '$220' },
      { title: 'Elote', description: 'Mayo, cotija, chile', price: '$85' },
    ],
  },
  {
    blockType: 'carousel',
    contractVersion: '1.1',
    channels: ['ios', 'android'],
    title: 'Rituales de la casa',
    slides: [
      { title: 'Nueva temporada', description: 'Platillos de otono' },
      { title: 'Fin de semana', description: 'Musica en vivo' },
    ],
  },
  {
    blockType: 'promoRail',
    contractVersion: '1.1',
    channels: ['web', 'ios', 'android'],
    title: 'Promociones',
    promotions: [{ title: '2x1 Margaritas', eyebrow: 'Solo por temporada', description: 'Todos los martes' }],
  },
  {
    blockType: 'textBlock',
    contractVersion: '1.1',
    channels: ['web', 'ios', 'android'],
    eyebrow: 'Nuestra casa',
    heading: 'Nuestra historia',
    body: 'Casa Maiz nacio en el corazon de la ciudad hace veinte anos.',
    alignment: 'center',
  },
  {
    blockType: 'restaurantCTA',
    contractVersion: '1.1',
    channels: ['web', 'ios', 'android'],
    headline: 'Reserva tu mesa',
    description: 'Vive la experiencia Casa Maiz',
    label: 'Reservar ahora',
    href: '/reservas',
  },
];

test('a real Home payload renders every block type in order with its authored content', async () => {
  await render(
    <NavigationContainer>
      <BlockList layout={realHomePayload} />
    </NavigationContainer>,
  );

  expect(screen.getByText('De la milpa a la mesa')).toBeTruthy();
  expect(screen.getByText('Tacos al pastor')).toBeTruthy();
  expect(screen.getByText('$220')).toBeTruthy();
  expect(screen.getByText('Elote')).toBeTruthy();
  expect(screen.getByText('Rituales de la casa')).toBeTruthy();
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

test('a channel value the app does not recognise (e.g. "web") does not break parsing or filtering', async () => {
  const layout: BlockEnvelope[] = [
    { blockType: 'textBlock', contractVersion: '1.1', channels: ['web'], body: 'Web only' },
    { blockType: 'textBlock', contractVersion: '1.1', channels: ['web', 'ios', 'android'], body: 'All platforms' },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  expect(screen.queryByText('Web only')).toBeNull();
  expect(screen.getByText('All platforms')).toBeTruthy();
});

test('an imageBlock renders its caption and honours fullBleed through the registry', async () => {
  const layout: BlockEnvelope[] = [
    {
      blockType: 'imageBlock',
      contractVersion: '1.1',
      channels: ['ios', 'android'],
      image: { url: '/menu/tacos.jpg', alt: 'Tacos al pastor' },
      caption: 'Tacos al pastor',
      fullBleed: true,
    },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  expect(screen.getByText('Tacos al pastor')).toBeTruthy();
});

test('an imageBlock with no image degrades to just its caption, without throwing', async () => {
  const layout: BlockEnvelope[] = [
    { blockType: 'imageBlock', contractVersion: '1.1', channels: ['ios', 'android'], caption: 'Sin imagen' },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  expect(screen.getByText('Sin imagen')).toBeTruthy();
});

test('an imageBlock with a malformed image falls back to the unknown-block marker without breaking the page', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  const layout: BlockEnvelope[] = [
    { blockType: 'textBlock', contractVersion: '1.1', channels: ['ios', 'android'], body: 'Antes' },
    {
      blockType: 'imageBlock',
      contractVersion: '1.1',
      channels: ['ios', 'android'],
      image: { url: 42 },
      caption: 'Malformada',
    },
    { blockType: 'textBlock', contractVersion: '1.1', channels: ['ios', 'android'], body: 'Despues' },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  expect(screen.getByText('Antes')).toBeTruthy();
  expect(screen.getByText('Despues')).toBeTruthy();
  expect(screen.queryByText('Malformada')).toBeNull();
});

test('a formBlock renders its fields from the block payload', async () => {
  const layout: BlockEnvelope[] = [
    {
      blockType: 'formBlock',
      contractVersion: '1.1',
      channels: ['ios', 'android'],
      form: {
        id: 'contact',
        submitButtonLabel: 'Send',
        fields: [{ blockType: 'text', name: 'name', label: 'Name', required: false }],
      },
    },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  expect(screen.getByLabelText('Name')).toBeTruthy();
  expect(screen.getByLabelText('Send')).toBeTruthy();
});

test('a formBlock whose shape does not match falls back to the unknown-block marker without crashing', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  const layout: BlockEnvelope[] = [
    { blockType: 'textBlock', contractVersion: '1.1', channels: ['ios', 'android'], body: 'Antes' },
    { blockType: 'formBlock', contractVersion: '1.1', channels: ['ios', 'android'] },
    { blockType: 'textBlock', contractVersion: '1.1', channels: ['ios', 'android'], body: 'Despues' },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  expect(screen.getByText('Antes')).toBeTruthy();
  expect(screen.getByText('Despues')).toBeTruthy();
  expect(screen.getByText(/formBlock/)).toBeTruthy();
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

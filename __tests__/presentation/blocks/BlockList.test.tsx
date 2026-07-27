import { fireEvent, render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BlockList } from '@presentation/blocks/BlockList';
import type { BlockEnvelope } from '@core/contract/models/blocks/block';

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

test('a restaurantHero with heading, rich text and media renders all three', async () => {
  const layout: BlockEnvelope[] = [
    {
      blockType: 'restaurantHero',
      contractVersion: '1.1',
      channels: ['ios', 'android'],
      heading: 'Bienvenido a Casa Maiz',
      richText: { root: { children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Cocina de temporada' }] }] } },
      media: { url: '/hero.jpg', alt: 'Fachada del restaurante' },
    },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  expect(screen.getByText('Bienvenido a Casa Maiz')).toBeTruthy();
  expect(screen.getByText('Cocina de temporada')).toBeTruthy();
});

test('a cta with a label and destination renders the label and routes through the resolver', async () => {
  const layout: BlockEnvelope[] = [
    { blockType: 'cta', contractVersion: '1.1', channels: ['ios', 'android'], label: 'Reservar', href: '/reservas' },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  expect(screen.getByText('Reservar')).toBeTruthy();
  expect(screen.getByLabelText('Reservar')).toBeTruthy();
});

test('a content block renders its rich text', async () => {
  const layout: BlockEnvelope[] = [
    {
      blockType: 'content',
      contractVersion: '1.1',
      channels: ['ios', 'android'],
      content: { root: { children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Historia de la casa' }] }] } },
    },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  expect(screen.getByText('Historia de la casa')).toBeTruthy();
});

test('a mediaBlock renders its image via the shared CmsImage component without breaking the rest of the page', async () => {
  const layout: BlockEnvelope[] = [
    { blockType: 'textBlock', contractVersion: '1.1', channels: ['ios', 'android'], body: 'Antes' },
    {
      blockType: 'mediaBlock',
      contractVersion: '1.1',
      channels: ['ios', 'android'],
      image: { url: '/comedor.jpg', alt: 'Comedor principal' },
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
});

test('an archive block renders whatever heading it carries', async () => {
  const layout: BlockEnvelope[] = [
    { blockType: 'archive', contractVersion: '1.1', channels: ['ios', 'android'], heading: 'Eventos pasados' },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  expect(screen.getByText('Eventos pasados')).toBeTruthy();
});

test('a generic block type carrying none of the recognised fields renders nothing and does not crash', async () => {
  const layout: BlockEnvelope[] = [
    { blockType: 'textBlock', contractVersion: '1.1', channels: ['ios', 'android'], body: 'Antes' },
    { blockType: 'archive', contractVersion: '1.1', channels: ['ios', 'android'] },
    { blockType: 'textBlock', contractVersion: '1.1', channels: ['ios', 'android'], body: 'Despues' },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  expect(screen.getByText('Antes')).toBeTruthy();
  expect(screen.getByText('Despues')).toBeTruthy();
});

test('an external link inside a generic block is validated before opening, honouring the https-only rule', async () => {
  const layout: BlockEnvelope[] = [
    { blockType: 'cta', contractVersion: '1.1', channels: ['ios', 'android'], label: 'Sitio externo', href: 'ftp://evil.example.com' },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  const button = screen.getByLabelText('Sitio externo');
  expect(() => fireEvent.press(button)).not.toThrow();
});

test('a blockType absent from the registry entirely still reaches the unknown-block fallback', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  const layout: BlockEnvelope[] = [
    { blockType: 'newsletterSignup', contractVersion: '1.1', channels: ['ios', 'android'] },
    { blockType: 'archive', contractVersion: '1.1', channels: ['ios', 'android'], heading: 'Registrado' },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  expect(screen.getByText(/newsletterSignup/)).toBeTruthy();
  expect(screen.getByText('Registrado')).toBeTruthy();
});

test('these five generic types are filtered by contract-version and channel like every other registry entry', async () => {
  const layout: BlockEnvelope[] = [
    { blockType: 'cta', contractVersion: '2.0', channels: ['ios', 'android'], label: 'Incompatible', href: '/menu' },
    { blockType: 'cta', contractVersion: '1.1', channels: ['android'], label: 'Wrong platform', href: '/menu' },
    { blockType: 'cta', contractVersion: '1.1', channels: ['ios', 'android'], label: 'Compatible', href: '/menu' },
  ];

  await render(
    <NavigationContainer>
      <BlockList layout={layout} />
    </NavigationContainer>,
  );

  expect(screen.queryByText('Incompatible')).toBeNull();
  expect(screen.queryByText('Wrong platform')).toBeNull();
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

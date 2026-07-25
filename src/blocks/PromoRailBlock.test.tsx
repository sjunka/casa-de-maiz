import { render, screen } from '@testing-library/react-native';
import { PromoRailBlock } from './PromoRailBlock';
import type { PromoRailBlock as PromoRailBlockData } from '../models/block';
import type { BootstrapPromotion } from '../models/promotion';

const block = (promotions: PromoRailBlockData['promotions']): PromoRailBlockData => ({
  blockType: 'promoRail',
  contractVersion: '1.1',
  channels: ['ios', 'android'],
  promotions,
});

const bootstrapPromotion: BootstrapPromotion = {
  id: 'promo-1',
  title: 'Martes de sobremesa',
  eyebrow: 'Solo por temporada',
  placement: 'home',
  priority: 10,
};

test("renders the block's own promotions when it has any", async () => {
  await render(
    <PromoRailBlock
      block={block([{ title: 'De la milpa a la mesa' }])}
      fallbackPromotions={[bootstrapPromotion]}
    />,
  );

  expect(screen.getByText('De la milpa a la mesa')).toBeTruthy();
  expect(screen.queryByText('Martes de sobremesa')).toBeNull();
});

test('falls back to bootstrap promotions only when the block itself returns none', async () => {
  await render(<PromoRailBlock block={block([])} fallbackPromotions={[bootstrapPromotion]} />);

  expect(screen.getByText('Martes de sobremesa')).toBeTruthy();
});

test('renders nothing extra when neither the block nor bootstrap provide promotions', async () => {
  await render(<PromoRailBlock block={block([])} />);

  expect(screen.queryByText('Martes de sobremesa')).toBeNull();
});

import { Platform } from 'react-native';
import { isContractVersionCompatible } from '../models/contractVersion';
import { SUPPORTED_CONTRACT_VERSION } from '../api/contract';
import { KNOWN_BLOCK_SCHEMAS, type BlockEnvelope, type KnownBlockType, type PromoRailBlock as PromoRailBlockData } from '../models/block';
import type { BootstrapPromotion } from '../models/promotion';
import { CardGridBlock } from './CardGridBlock';
import { CarouselBlock } from './CarouselBlock';
import { PromoRailBlock } from './PromoRailBlock';
import { TextBlock } from './TextBlock';
import { RestaurantCtaBlock } from './RestaurantCtaBlock';
import { ImageBlock } from './ImageBlock';
import { FormBlock } from './FormBlock';
import { UnknownBlock } from './UnknownBlock';
import { reportUnknownBlock } from '../observability/crashReporting';

type UnsafeBlockComponent = (props: { block: never }) => React.JSX.Element | null;

const REGISTRY: Record<KnownBlockType, UnsafeBlockComponent> = {
  cardGrid: CardGridBlock,
  carousel: CarouselBlock,
  promoRail: PromoRailBlock,
  textBlock: TextBlock,
  restaurantCTA: RestaurantCtaBlock,
  imageBlock: ImageBlock,
  formBlock: FormBlock,
} as Record<KnownBlockType, UnsafeBlockComponent>;

const isKnownBlockType = (blockType: string): blockType is KnownBlockType =>
  Object.prototype.hasOwnProperty.call(KNOWN_BLOCK_SCHEMAS, blockType);

const isForRunningPlatform = (channels: unknown): boolean =>
  !Array.isArray(channels) || channels.includes(Platform.OS);

type RenderContext = { fallbackPromotions?: BootstrapPromotion[] };

export const renderBlock = (
  envelope: BlockEnvelope,
  key: React.Key,
  context: RenderContext = {},
): React.ReactElement | null => {
  const channels = (envelope as { channels?: unknown }).channels;
  if (!isForRunningPlatform(channels)) {
    return null;
  }

  const contractVersion = (envelope as { contractVersion?: unknown }).contractVersion;
  if (typeof contractVersion !== 'string' || !isContractVersionCompatible(contractVersion, SUPPORTED_CONTRACT_VERSION)) {
    return null;
  }

  const blockType = envelope.blockType;
  if (!isKnownBlockType(blockType)) {
    console.warn(`[blocks] unknown block type: ${blockType}`);
    reportUnknownBlock(blockType);
    return <UnknownBlock key={key} blockType={blockType} />;
  }

  const parsed = KNOWN_BLOCK_SCHEMAS[blockType].safeParse(envelope);
  if (!parsed.success) {
    console.warn(`[blocks] block failed validation: ${blockType}`);
    reportUnknownBlock(blockType);
    return <UnknownBlock key={key} blockType={blockType} />;
  }

  if (blockType === 'promoRail') {
    return (
      <PromoRailBlock
        key={key}
        block={parsed.data as PromoRailBlockData}
        fallbackPromotions={context.fallbackPromotions}
      />
    );
  }

  const Component = REGISTRY[blockType];
  return <Component key={key} block={parsed.data as never} />;
};

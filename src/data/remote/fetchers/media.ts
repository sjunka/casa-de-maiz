import { API_BASE_URL } from '@core/transport/config';
import type { MediaAsset } from '@core/contract/models/primitives/media';

const ABSOLUTE_URL = /^https?:\/\//i;

export const resolveMediaUrl = (path: string): string =>
  ABSOLUTE_URL.test(path) ? path : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export type ImageSource = { uri: string; aspectRatio: number | undefined; alt: string };

type MediaFields = { image?: MediaAsset | null; mobileImage?: MediaAsset | null };

export const resolveImageSource = (
  media: MediaFields,
  containerWidth: number,
  pixelRatio: number,
): ImageSource | null => {
  const source = media.mobileImage ?? media.image;
  if (!source) {
    return null;
  }

  const targetWidth = containerWidth * pixelRatio;
  const sizedCandidates = Object.values(source.sizes ?? {}).filter(
    (size): size is { url: string; width: number; height?: number | null } =>
      size.url != null && size.width != null,
  );
  const bigEnoughSorted = sizedCandidates
    .filter(size => size.width >= targetWidth)
    .sort((a, b) => a.width - b.width);
  const largestSorted = [...sizedCandidates].sort((a, b) => b.width - a.width);
  const chosenUrl = bigEnoughSorted[0]?.url ?? largestSorted[0]?.url ?? source.url;

  return {
    uri: resolveMediaUrl(chosenUrl),
    aspectRatio: source.width && source.height ? source.width / source.height : undefined,
    alt: source.alt,
  };
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';
import { fetchEnvelope } from '@core/transport/client';
import { buildDeliveryContext, type DeliveryContext } from '@core/contract/deliveryContext';
import type { ApiError } from '@core/transport/apiError';
import type { ContractVersion } from '@core/contract/models/contractVersion';
import type { envelopeSchema } from '@core/contract/models/envelope';

type CacheEntry = {
  envelope: unknown;
  deliveryContext: DeliveryContext;
  contractVersion: ContractVersion;
};

const cacheKey = (path: string) => `cache:${path}`;

const sameScope = (a: DeliveryContext, b: DeliveryContext): boolean =>
  a.platform === b.platform && a.market === b.market && a.audience === b.audience && a.appVersion === b.appVersion;

const sameVersion = (a: ContractVersion, b: ContractVersion): boolean =>
  a.major === b.major && a.minor === b.minor;

const isExpired = (nextChangeAt: unknown): boolean => {
  if (typeof nextChangeAt !== 'string') return false;
  const boundary = Date.parse(nextChangeAt);
  return Number.isFinite(boundary) && boundary <= Date.now();
};

const readCache = async (
  path: string,
  deliveryContext: DeliveryContext,
  contractVersion: ContractVersion,
): Promise<unknown | null> => {
  const raw = await AsyncStorage.getItem(cacheKey(path));
  if (!raw) return null;

  let entry: CacheEntry;
  try {
    entry = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!sameScope(entry.deliveryContext, deliveryContext) || !sameVersion(entry.contractVersion, contractVersion)) {
    return null;
  }

  const envelope = entry.envelope as { nextChangeAt?: unknown };
  if (isExpired(envelope.nextChangeAt)) {
    return null;
  }

  return entry.envelope;
};

const writeCache = (
  path: string,
  envelope: unknown,
  deliveryContext: DeliveryContext,
  contractVersion: ContractVersion,
): Promise<void> => {
  const entry: CacheEntry = { envelope, deliveryContext, contractVersion };
  return AsyncStorage.setItem(cacheKey(path), JSON.stringify(entry));
};

export const fetchWithCache = async <T extends z.ZodTypeAny>(
  path: string,
  dataSchema: T,
  supportedContractVersion: ContractVersion,
): Promise<z.infer<ReturnType<typeof envelopeSchema<T>>> & { isSaved: boolean }> => {
  const deliveryContext = buildDeliveryContext();

  try {
    const envelope = await fetchEnvelope(path, dataSchema, supportedContractVersion);
    await writeCache(path, envelope, deliveryContext, supportedContractVersion);
    return { ...envelope, isSaved: false };
  } catch (error) {
    if ((error as ApiError).kind === 'unsupported-contract') {
      throw error;
    }

    const cached = await readCache(path, deliveryContext, supportedContractVersion);
    if (cached) {
      return { ...(cached as object), isSaved: true } as z.infer<ReturnType<typeof envelopeSchema<T>>> & {
        isSaved: boolean;
      };
    }

    throw error;
  }
};

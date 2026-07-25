import { z } from 'zod';
import { API_BASE_URL } from './config';
import { buildDeliveryContext } from './deliveryContext';
import {
  ApiError,
  httpError,
  networkError,
  notFoundError,
  parseError,
  unsupportedContractError,
} from './apiError';
import { envelopeSchema } from '../models/envelope';
import { isContractVersionCompatible, type ContractVersion } from '../models/contractVersion';

const buildUrl = (path: string): string => {
  const params = new URLSearchParams({ ...buildDeliveryContext() });
  return `${API_BASE_URL}${path}?${params.toString()}`;
};

const logAndThrow = (error: ApiError): never => {
  console.error(`[api] ${error.kind}: ${error.message}`);
  throw error;
};

export const fetchEnvelope = async <T extends z.ZodTypeAny>(
  path: string,
  dataSchema: T,
  supportedContractVersion: ContractVersion,
): Promise<z.infer<ReturnType<typeof envelopeSchema<T>>>> => {
  let response: Response;
  try {
    response = await fetch(buildUrl(path));
  } catch (cause) {
    return logAndThrow(networkError(path, cause));
  }

  if (!response.ok) {
    return logAndThrow(response.status === 404 ? notFoundError(path) : httpError(path, response.status));
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return logAndThrow(parseError(path, 'malformed JSON'));
  }

  const parsed = envelopeSchema(dataSchema).safeParse(json);
  if (!parsed.success) {
    return logAndThrow(parseError(path, parsed.error.message));
  }

  if (!isContractVersionCompatible(parsed.data.contractVersion, supportedContractVersion)) {
    return logAndThrow(unsupportedContractError(path, parsed.data.contractVersion));
  }

  return parsed.data;
};

export type { ApiError };

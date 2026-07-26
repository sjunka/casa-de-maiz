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
import { reportTransportError } from '../observability/crashReporting';

const buildUrl = (path: string): string => {
  const params = new URLSearchParams({ ...buildDeliveryContext() });
  return `${API_BASE_URL}${path}?${params.toString()}`;
};

const logAndThrow = (error: ApiError, path: string, status?: number): never => {
  console.error(`[api] ${error.kind}: ${error.message}`);
  reportTransportError(error, { endpoint: path, status, kind: error.kind });
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
    return logAndThrow(networkError(path, cause), path);
  }

  if (!response.ok) {
    return logAndThrow(
      response.status === 404 ? notFoundError(path) : httpError(path, response.status),
      path,
      response.status,
    );
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return logAndThrow(parseError(path, 'malformed JSON'), path, response.status);
  }

  const parsed = envelopeSchema(dataSchema).safeParse(json);
  if (!parsed.success) {
    return logAndThrow(parseError(path, parsed.error.message), path, response.status);
  }

  if (!isContractVersionCompatible(parsed.data.contractVersion, supportedContractVersion)) {
    return logAndThrow(unsupportedContractError(path, parsed.data.contractVersion), path, response.status);
  }

  return parsed.data;
};

export type { ApiError };

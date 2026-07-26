import { z } from 'zod';
import { API_BASE_URL } from './config';
import { buildDeliveryContext } from '../contract/deliveryContext';
import {
  ApiError,
  httpError,
  networkError,
  notFoundError,
  parseError,
  unsupportedContractError,
} from './apiError';
import { envelopeSchema } from '../contract/models/envelope';
import { isContractVersionCompatible, type ContractVersion } from '../contract/models/contractVersion';

export type TransportErrorReporter = (
  error: ApiError,
  context: { endpoint: string; status?: number; kind: string },
) => void;

let reportTransportError: TransportErrorReporter = () => {};

export const setTransportErrorReporter = (reporter: TransportErrorReporter): void => {
  reportTransportError = reporter;
};

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

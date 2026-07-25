import { fetchEnvelope } from './client';
import { SUPPORTED_CONTRACT_VERSION } from './contract';
import { legalDocumentDataSchema } from '../models/legalDocument';

export const fetchLegalDocument = (key: string) =>
  fetchEnvelope(`/api/content/v1/legal/${key}`, legalDocumentDataSchema, SUPPORTED_CONTRACT_VERSION);

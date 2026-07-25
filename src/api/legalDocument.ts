import { fetchEnvelope } from './client';
import { legalDocumentDataSchema } from '../models/legalDocument';
import { SUPPORTED_CONTRACT_VERSION } from './bootstrap';

export const fetchLegalDocument = (key: string) =>
  fetchEnvelope(`/legal/${key}`, legalDocumentDataSchema, SUPPORTED_CONTRACT_VERSION);

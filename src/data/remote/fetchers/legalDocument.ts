import { fetchEnvelope } from '@core/transport/client';
import { SUPPORTED_CONTRACT_VERSION } from '@core/contract/contract';
import { legalDocumentDataSchema } from '@core/contract/models/screens/legalDocument';

export const fetchLegalDocument = (key: string) =>
  fetchEnvelope(`/api/content/v1/legal/${key}`, legalDocumentDataSchema, SUPPORTED_CONTRACT_VERSION);

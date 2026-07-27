import { fetchEnvelope } from '@core/transport/client';
import { SUPPORTED_CONTRACT_VERSION } from '@core/contract/contract';
import { bootstrapDataSchema } from '@core/contract/models/screens/bootstrap';

export const fetchBootstrap = () =>
  fetchEnvelope('/api/content/v1/bootstrap', bootstrapDataSchema, SUPPORTED_CONTRACT_VERSION);

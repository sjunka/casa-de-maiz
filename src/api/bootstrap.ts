import { fetchEnvelope } from './client';
import { SUPPORTED_CONTRACT_VERSION } from './contract';
import { bootstrapDataSchema } from '../models/bootstrap';

export const fetchBootstrap = () =>
  fetchEnvelope('/api/content/v1/bootstrap', bootstrapDataSchema, SUPPORTED_CONTRACT_VERSION);

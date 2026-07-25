import { fetchEnvelope } from './client';
import { bootstrapDataSchema } from '../models/bootstrap';
import type { ContractVersion } from '../models/contractVersion';

export const SUPPORTED_CONTRACT_VERSION: ContractVersion = { major: 1, minor: 1 };

export const fetchBootstrap = () =>
  fetchEnvelope('/bootstrap', bootstrapDataSchema, SUPPORTED_CONTRACT_VERSION);

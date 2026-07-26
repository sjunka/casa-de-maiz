import { fetchWithCache } from './cache';
import { SUPPORTED_CONTRACT_VERSION } from '@core/contract/contract';
import { homeDataSchema } from '@core/contract/models/home';

export const fetchHome = () =>
  fetchWithCache('/api/content/v1/pages/home', homeDataSchema, SUPPORTED_CONTRACT_VERSION);

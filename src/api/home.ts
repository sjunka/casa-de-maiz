import { fetchWithCache } from './cache';
import { SUPPORTED_CONTRACT_VERSION } from './contract';
import { homeDataSchema } from '../models/home';

export const fetchHome = () =>
  fetchWithCache('/api/content/v1/pages/home', homeDataSchema, SUPPORTED_CONTRACT_VERSION);

import { fetchWithCache } from './cache';
import { SUPPORTED_CONTRACT_VERSION } from './contract';
import { menuDataSchema } from '../models/menu';

export const fetchMenu = () =>
  fetchWithCache('/api/content/v1/pages/menu', menuDataSchema, SUPPORTED_CONTRACT_VERSION);

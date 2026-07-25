import { API_BASE_URL } from './config';

const ABSOLUTE_URL = /^https?:\/\//i;

export const resolveMediaUrl = (path: string): string =>
  ABSOLUTE_URL.test(path) ? path : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

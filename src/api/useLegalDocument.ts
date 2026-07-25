import { useQuery } from '@tanstack/react-query';
import { fetchLegalDocument } from './legalDocument';
import type { ApiError } from './apiError';

export const useLegalDocument = (key: string) =>
  useQuery<Awaited<ReturnType<typeof fetchLegalDocument>>, ApiError>({
    queryKey: ['legal', key],
    queryFn: () => fetchLegalDocument(key),
  });

import { useQuery } from '@tanstack/react-query';
import { fetchBootstrap } from './bootstrap';
import type { ApiError } from './apiError';

export const useBootstrap = () =>
  useQuery<Awaited<ReturnType<typeof fetchBootstrap>>, ApiError>({
    queryKey: ['bootstrap'],
    queryFn: fetchBootstrap,
  });

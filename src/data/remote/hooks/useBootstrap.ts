import { useQuery } from '@tanstack/react-query';
import { fetchBootstrap } from '../fetchers/bootstrap';
import type { ApiError } from '@core/transport/apiError';

export const useBootstrap = () =>
  useQuery<Awaited<ReturnType<typeof fetchBootstrap>>, ApiError>({
    queryKey: ['bootstrap'],
    queryFn: fetchBootstrap,
    staleTime: Infinity,
  });

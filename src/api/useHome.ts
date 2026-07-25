import { useQuery } from '@tanstack/react-query';
import { fetchHome } from './home';
import type { ApiError } from './apiError';

export const useHome = () =>
  useQuery<Awaited<ReturnType<typeof fetchHome>>, ApiError>({
    queryKey: ['home'],
    queryFn: fetchHome,
  });

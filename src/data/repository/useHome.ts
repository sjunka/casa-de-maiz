import { useQuery } from '@tanstack/react-query';
import { fetchHome } from './home';
import type { ApiError } from '@core/transport/apiError';

export const useHome = () =>
  useQuery<Awaited<ReturnType<typeof fetchHome>>, ApiError>({
    queryKey: ['home'],
    queryFn: fetchHome,
  });

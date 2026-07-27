import { useQuery } from '@tanstack/react-query';
import { fetchMenu } from '../fetchers/menu';
import type { ApiError } from '@core/transport/apiError';

export const useMenu = () =>
  useQuery<Awaited<ReturnType<typeof fetchMenu>>, ApiError>({
    queryKey: ['menu'],
    queryFn: fetchMenu,
  });

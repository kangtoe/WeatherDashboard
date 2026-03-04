import { useEffect, useState } from 'react';
import { fetchDailyForecast } from '../api/weather';
import type { DailyForecast } from '../types/weather';

interface UseDailyForecastResult {
  data: DailyForecast[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDailyForecast(nx: number, ny: number): UseDailyForecastResult {
  const [data, setData] = useState<DailyForecast[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchDailyForecast(nx, ny, controller.signal);
        setData(result);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, [nx, ny, trigger]);

  const refetch = () => setTrigger((prev) => prev + 1);

  return { data, isLoading, error, refetch };
}

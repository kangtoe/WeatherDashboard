import { useEffect, useState } from 'react';
import { fetchHourlyForecast } from '../api/weather';
import type { HourlyForecast } from '../types/weather';

interface UseHourlyForecastResult {
  data: HourlyForecast[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useHourlyForecast(nx: number, ny: number): UseHourlyForecastResult {
  const [data, setData] = useState<HourlyForecast[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchHourlyForecast(nx, ny, controller.signal);
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

import { useState } from 'react';
import { CITIES } from './types/weather';
import type { Location } from './types/weather';
import { useWeather } from './hooks/useWeather';
import { useHourlyForecast } from './hooks/useHourlyForecast';
import { useDailyForecast } from './hooks/useDailyForecast';
import { clearCache } from './api/weather';
import { LocationSelector } from './components/LocationSelector';
import { CurrentWeather } from './components/CurrentWeather';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';

function App() {
  const [location, setLocation] = useState<Location>(CITIES[0]);
  const { data, isLoading, error, refetch } = useWeather(location.nx, location.ny);
  const forecast = useHourlyForecast(location.nx, location.ny);
  const daily = useDailyForecast(location.nx, location.ny);

  const handleRefresh = () => {
    clearCache();
    refetch();
    forecast.refetch();
    daily.refetch();
  };

  const refreshing = isLoading || forecast.isLoading;

  // 현재 이후 첫 시간별 예보에서 강수확률/하늘상태
  const now = new Date();
  const nowTime = String(now.getHours()).padStart(2, '0') + '00';
  const todayStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const firstForecast = forecast.data?.find(
    (d) => d.date > todayStr || (d.date === todayStr && d.time >= nowTime),
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="w-11 sm:w-8" />
          <h1 className="text-xl font-bold text-gray-900">
            Weather Dashboard
          </h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-50 cursor-pointer"
            title="새로고침"
          >
            <svg
              className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h5M20 20v-5h-5M4.93 15.36A8 8 0 0 0 20 12M3.98 12A8 8 0 0 1 19.07 8.64"
              />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
        {/* 지역 선택 */}
        <LocationSelector selected={location} onSelect={setLocation} />

        {/* 로딩 */}
        {isLoading && <LoadingSpinner />}

        {/* 에러 */}
        {error && <ErrorMessage message={error} onRetry={refetch} />}

        {/* 현재 날씨 */}
        {data && !isLoading && !error && (
          <CurrentWeather
            data={data}
            location={location}
            precipitationProbability={firstForecast?.precipitationProbability}
            sky={firstForecast?.sky}
          />
        )}

        {/* 시간별 차트 */}
        {forecast.error && !error && (
          <ErrorMessage message={forecast.error} onRetry={forecast.refetch} />
        )}
        {forecast.data && !forecast.isLoading && !forecast.error && (
          <HourlyForecast data={forecast.data} />
        )}

        {/* 일별 예보 */}
        {daily.data && !daily.isLoading && !daily.error && (
          <DailyForecast data={daily.data} />
        )}
      </main>
    </div>
  );
}

export default App;

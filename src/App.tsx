import { useState, useEffect, useRef } from 'react';
import { CITIES } from './types/weather';
import type { Location } from './types/weather';
import { useWeather } from './hooks/useWeather';
import { useHourlyForecast } from './hooks/useHourlyForecast';
import { useDailyForecast } from './hooks/useDailyForecast';
import { useTheme } from './hooks/useTheme';
import { useGeolocation } from './hooks/useGeolocation';
import { clearCache } from './api/weather';
import { LocationSelector } from './components/LocationSelector';
import { CurrentWeather } from './components/CurrentWeather';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';

function App() {
  const [location, setLocation] = useState<Location>(CITIES[0]);
  const manuallySelected = useRef(false);
  const { nearestCity } = useGeolocation();
  const { data, isLoading, error, refetch } = useWeather(location.nx, location.ny);
  const forecast = useHourlyForecast(location.nx, location.ny);
  const daily = useDailyForecast(location.nx, location.ny);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (nearestCity && !manuallySelected.current) {
      setLocation(nearestCity);
    }
  }, [nearestCity]);

  const handleLocationSelect = (loc: Location) => {
    manuallySelected.current = true;
    setLocation(loc);
  };

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white ml-1">Weather</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
              title="테마 전환"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 cursor-pointer"
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
            <LocationSelector selected={location} onSelect={handleLocationSelect} />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
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
          <HourlyForecast data={forecast.data} theme={theme} />
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

import { useState } from 'react';
import { CITIES } from './types/weather';
import type { Location } from './types/weather';
import { useWeather } from './hooks/useWeather';
import { LocationSelector } from './components/LocationSelector';
import { CurrentWeather } from './components/CurrentWeather';
import { WeatherDetails } from './components/WeatherDetails';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';

function App() {
  const [location, setLocation] = useState<Location>(CITIES[0]); // 기본: 서울
  const { data, isLoading, error, refetch } = useWeather(location.nx, location.ny);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 text-center">
            Weather Dashboard
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* 지역 선택 */}
        <LocationSelector selected={location} onSelect={setLocation} />

        {/* 로딩 */}
        {isLoading && <LoadingSpinner />}

        {/* 에러 */}
        {error && <ErrorMessage message={error} onRetry={refetch} />}

        {/* 날씨 데이터 */}
        {data && !isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CurrentWeather data={data} location={location} />
            <WeatherDetails data={data} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

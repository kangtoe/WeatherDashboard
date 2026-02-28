import type { CurrentWeather as CurrentWeatherData, Location } from '../types/weather';
import { PTY_TEXT } from '../types/weather';

interface CurrentWeatherProps {
  data: CurrentWeatherData;
  location: Location;
}

export function CurrentWeather({ data, location }: CurrentWeatherProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg text-gray-500 mb-1">{location.name}</h2>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-6xl font-light text-gray-900">
          {data.temperature}
        </span>
        <span className="text-2xl text-gray-400">°C</span>
      </div>
      <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
        {PTY_TEXT[data.precipitationType] ?? '알 수 없음'}
      </span>
    </div>
  );
}

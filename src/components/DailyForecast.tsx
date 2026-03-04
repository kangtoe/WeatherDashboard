import type { DailyForecast as DailyForecastData } from '../types/weather';
import { SKY_TEXT, PTY_TEXT } from '../types/weather';

interface DailyForecastProps {
  data: DailyForecastData[];
}

function getWeatherIcon(sky: number, pty: number): string {
  if (pty === 1) return '🌧️';
  if (pty === 2) return '🌨️';
  if (pty === 3) return '❄️';
  if (pty === 4) return '🌦️';
  if (sky === 1) return '☀️';
  if (sky === 3) return '⛅';
  if (sky === 4) return '☁️';
  return '☀️';
}

function getWeatherText(sky: number, pty: number): string {
  if (pty > 0) return PTY_TEXT[pty] ?? '';
  return SKY_TEXT[sky] ?? '';
}

function getTodayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}

export function DailyForecast({ data }: DailyForecastProps) {
  if (data.length === 0) return null;

  const today = getTodayStr();

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-3 sm:mb-4">일별 예보</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-x-visible">
        {data.map((day) => (
          <div
            key={day.date}
            className={`min-w-20 flex-shrink-0 sm:flex-1 sm:min-w-0 sm:flex-shrink flex flex-col items-center gap-2 rounded-xl p-3 sm:p-4 ${
              day.date === today ? 'bg-blue-50' : 'bg-gray-50'
            }`}
          >
            <span className="text-sm font-medium text-gray-700">
              {day.date === today ? '오늘' : `${day.dayOfWeek}요일`}
            </span>
            <span className="text-3xl">{getWeatherIcon(day.sky, day.precipitationType)}</span>
            <span className="text-xs text-gray-500">{getWeatherText(day.sky, day.precipitationType)}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-medium text-gray-900">{day.maxTemp}°</span>
              <span className="text-sm text-gray-400">/ {day.minTemp}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

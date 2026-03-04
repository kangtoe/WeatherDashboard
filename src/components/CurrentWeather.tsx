import type { CurrentWeather as CurrentWeatherData, Location } from '../types/weather';
import { PTY_TEXT, SKY_TEXT, getWindDirectionText } from '../types/weather';

interface CurrentWeatherProps {
  data: CurrentWeatherData;
  location: Location;
  precipitationProbability?: number;
  sky?: number;
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

function formatCurrentTime(): { dayStr: string; timeStr: string } {
  const now = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const day = days[now.getDay()];
  const h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const ampm = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 || 12;
  return {
    dayStr: `(${day}요일)`,
    timeStr: `${ampm} ${hour12}:${m}`,
  };
}

export function CurrentWeather({ data, location, precipitationProbability, sky }: CurrentWeatherProps) {
  const { dayStr, timeStr } = formatCurrentTime();
  const displaySky = sky ?? (data.precipitationType > 0 ? 0 : 1);
  const weatherIcon = getWeatherIcon(displaySky, data.precipitationType);
  const weatherText = getWeatherText(displaySky, data.precipitationType);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{weatherIcon}</span>
          <div className="flex items-baseline">
            <span className="text-5xl font-light text-gray-900">{data.temperature}</span>
            <span className="text-xl text-gray-400 ml-1">°C</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-medium text-gray-900">{location.name}</p>
          <p className="text-sm text-gray-400">{dayStr} {timeStr}</p>
          <p className="text-sm text-gray-600 mt-1">{weatherText}</p>
        </div>
      </div>
      <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
        {precipitationProbability != null && (
          <span>강수확률 {precipitationProbability}%</span>
        )}
        <span>습도 {data.humidity}%</span>
        <span>풍속 {data.windSpeed}m/s</span>
        <span>{getWindDirectionText(data.windDirection)}</span>
      </div>
    </div>
  );
}

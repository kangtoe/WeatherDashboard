import type { CurrentWeather } from '../types/weather';
import { getWindDirectionText } from '../types/weather';

interface WeatherDetailsProps {
  data: CurrentWeather;
}

interface DetailItemProps {
  label: string;
  value: string;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-lg font-medium text-gray-900">{value}</p>
    </div>
  );
}

export function WeatherDetails({ data }: WeatherDetailsProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-4">상세 정보</h3>
      <div className="grid grid-cols-2 gap-3">
        <DetailItem label="습도" value={`${data.humidity}%`} />
        <DetailItem
          label="풍속"
          value={`${data.windSpeed} m/s`}
        />
        <DetailItem
          label="풍향"
          value={`${getWindDirectionText(data.windDirection)} (${data.windDirection}°)`}
        />
        <DetailItem
          label="강수량"
          value={data.precipitation === '0' ? '-' : `${data.precipitation} mm`}
        />
      </div>
    </div>
  );
}

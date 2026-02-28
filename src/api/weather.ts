import type { WeatherApiResponse, CurrentWeather } from '../types/weather';

const BASE_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

/** 현재 시각 기준 base_date, base_time 계산 (초단기실황) */
function getBaseDateTime(): { baseDate: string; baseTime: string } {
  const now = new Date();
  // 초단기실황: 매시 정각 발표, +40분 후 조회 가능
  // 현재 분이 40분 미만이면 이전 시간 사용
  if (now.getMinutes() < 40) {
    now.setHours(now.getHours() - 1);
  }

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');

  return {
    baseDate: `${year}${month}${day}`,
    baseTime: `${hour}00`,
  };
}

/** 초단기실황 조회 → 가공된 CurrentWeather 반환 */
export async function fetchCurrentWeather(
  nx: number,
  ny: number,
  signal?: AbortSignal,
): Promise<CurrentWeather> {
  const { baseDate, baseTime } = getBaseDateTime();

  const params = new URLSearchParams({
    serviceKey: API_KEY,
    numOfRows: '10',
    pageNo: '1',
    dataType: 'JSON',
    base_date: baseDate,
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
  });

  const res = await fetch(`${BASE_URL}/getUltraSrtNcst?${params}`, { signal });

  if (!res.ok) {
    throw new Error(`HTTP 오류: ${res.status}`);
  }

  const json: WeatherApiResponse = await res.json();

  const { resultCode, resultMsg } = json.response.header;
  if (resultCode !== '00') {
    throw new Error(`API 오류: ${resultMsg} (${resultCode})`);
  }

  const items = json.response.body.items.item;

  const getValue = (category: string): string => {
    return items.find((item) => item.category === category)?.obsrValue ?? '0';
  };

  return {
    temperature: parseFloat(getValue('T1H')),
    humidity: parseFloat(getValue('REH')),
    windSpeed: parseFloat(getValue('WSD')),
    windDirection: parseFloat(getValue('VEC')),
    precipitationType: parseInt(getValue('PTY'), 10),
    precipitation: getValue('RN1'),
  };
}

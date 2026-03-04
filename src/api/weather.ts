import type { WeatherApiResponse, CurrentWeather, HourlyForecast, DailyForecast } from '../types/weather';
import { getDayOfWeek } from '../types/weather';

const BASE_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// 인메모리 캐시: baseDate+baseTime이 바뀌면 자연스럽게 miss 처리
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10분

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(): void {
  cache.clear();
}

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

const FORECAST_BASE_HOURS = [2, 5, 8, 11, 14, 17, 20, 23];

/** 현재 시각 기준 base_date, base_time 계산 (단기예보) */
function getForecastBaseDateTime(): { baseDate: string; baseTime: string } {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // 각 발표시각 +10분 후 사용 가능
  const available = FORECAST_BASE_HOURS.filter(
    (h) => h < currentHour || (h === currentHour && currentMinute >= 10)
  );

  if (available.length === 0) {
    // 자정~02:10: 전일 2300 발표분 사용
    now.setDate(now.getDate() - 1);
  }

  const baseHour = available.length === 0 ? 23 : available[available.length - 1];
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return {
    baseDate: `${year}${month}${day}`,
    baseTime: String(baseHour).padStart(2, '0') + '00',
  };
}

/** 초단기실황 조회 → 가공된 CurrentWeather 반환 */
export async function fetchCurrentWeather(
  nx: number,
  ny: number,
  signal?: AbortSignal,
): Promise<CurrentWeather> {
  const { baseDate, baseTime } = getBaseDateTime();

  const cacheKey = `current_${baseDate}_${baseTime}_${nx}_${ny}`;
  const cached = getCached<CurrentWeather>(cacheKey);
  if (cached) return cached;

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

  const result: CurrentWeather = {
    temperature: parseFloat(getValue('T1H')),
    humidity: parseFloat(getValue('REH')),
    windSpeed: parseFloat(getValue('WSD')),
    windDirection: parseFloat(getValue('VEC')),
    precipitationType: parseInt(getValue('PTY'), 10),
    precipitation: getValue('RN1'),
  };

  setCache(cacheKey, result);
  return result;
}

interface ForecastResult {
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

/** 단기예보 원본 데이터 조회 (캐시 포함) */
async function fetchForecastRaw(
  nx: number,
  ny: number,
  signal?: AbortSignal,
): Promise<ForecastResult> {
  const { baseDate, baseTime } = getForecastBaseDateTime();

  const cacheKey = `forecast_${baseDate}_${baseTime}_${nx}_${ny}`;
  const cached = getCached<ForecastResult>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    serviceKey: API_KEY,
    numOfRows: '1000',
    pageNo: '1',
    dataType: 'JSON',
    base_date: baseDate,
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
  });

  const res = await fetch(`${BASE_URL}/getVilageFcst?${params}`, { signal });

  if (!res.ok) {
    throw new Error(`HTTP 오류: ${res.status}`);
  }

  const json: WeatherApiResponse = await res.json();

  const { resultCode, resultMsg } = json.response.header;
  if (resultCode !== '00') {
    throw new Error(`API 오류: ${resultMsg} (${resultCode})`);
  }

  const items = json.response.body.items.item;

  // === 시간별 그룹핑 ===
  const hourMap = new Map<string, Partial<HourlyForecast>>();
  // === 일별 그룹핑 ===
  const dayMap = new Map<string, { minTemp?: number; maxTemp?: number; skys: number[]; ptys: number[]; pops: number[]; wsds: number[]; rehs: number[] }>();

  for (const item of items) {
    const fcstDate = item.fcstDate!;
    const fcstTime = item.fcstTime!;
    const value = item.fcstValue ?? '0';

    // 시간별
    const hourKey = `${fcstDate}_${fcstTime}`;
    if (!hourMap.has(hourKey)) {
      hourMap.set(hourKey, { date: fcstDate, time: fcstTime });
    }
    const hourEntry = hourMap.get(hourKey)!;

    switch (item.category) {
      case 'TMP':
        hourEntry.temperature = parseFloat(value);
        break;
      case 'SKY':
        hourEntry.sky = parseInt(value, 10);
        break;
      case 'PTY':
        hourEntry.precipitationType = parseInt(value, 10);
        break;
      case 'POP':
        hourEntry.precipitationProbability = parseInt(value, 10);
        break;
      case 'WSD':
        hourEntry.windSpeed = parseFloat(value);
        break;
      case 'VEC':
        hourEntry.windDirection = parseFloat(value);
        break;
      case 'REH':
        hourEntry.humidity = parseFloat(value);
        break;
    }

    // 일별
    if (!dayMap.has(fcstDate)) {
      dayMap.set(fcstDate, { skys: [], ptys: [], pops: [], wsds: [], rehs: [] });
    }
    const dayEntry = dayMap.get(fcstDate)!;

    switch (item.category) {
      case 'TMN':
        dayEntry.minTemp = parseFloat(value);
        break;
      case 'TMX':
        dayEntry.maxTemp = parseFloat(value);
        break;
      case 'SKY':
        dayEntry.skys.push(parseInt(value, 10));
        break;
      case 'PTY':
        dayEntry.ptys.push(parseInt(value, 10));
        break;
      case 'POP':
        dayEntry.pops.push(parseInt(value, 10));
        break;
      case 'WSD':
        dayEntry.wsds.push(parseFloat(value));
        break;
      case 'REH':
        dayEntry.rehs.push(parseFloat(value));
        break;
    }
  }

  // === hourly 결과 ===
  const now = new Date();
  const nowDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const nowTime = String(now.getHours()).padStart(2, '0') + '00';

  // 3시간 간격 시각만 포함
  const THREE_HOUR_TIMES = new Set(['0000', '0300', '0600', '0900', '1200', '1500', '1800', '2100']);

  const hourly: HourlyForecast[] = [];
  for (const entry of hourMap.values()) {
    if (
      entry.date != null && entry.time != null &&
      THREE_HOUR_TIMES.has(entry.time) &&
      entry.temperature != null && entry.humidity != null && entry.sky != null &&
      entry.precipitationType != null && entry.precipitationProbability != null &&
      entry.windSpeed != null && entry.windDirection != null
    ) {
      if (entry.date > nowDate || (entry.date === nowDate && entry.time > nowTime)) {
        hourly.push(entry as HourlyForecast);
      }
    }
  }
  hourly.sort((a, b) => a.date !== b.date ? a.date.localeCompare(b.date) : a.time.localeCompare(b.time));

  // === daily 결과 ===
  // TMN/TMX가 없는 날(오늘 등)은 시간별 TMP에서 min/max 보정
  for (const [date, entry] of dayMap.entries()) {
    if (entry.minTemp == null || entry.maxTemp == null) {
      const temps: number[] = [];
      for (const h of hourMap.values()) {
        if (h.date === date && h.temperature != null) {
          temps.push(h.temperature);
        }
      }
      if (temps.length > 0) {
        if (entry.minTemp == null) entry.minTemp = Math.min(...temps);
        if (entry.maxTemp == null) entry.maxTemp = Math.max(...temps);
      }
    }
  }

  const daily: DailyForecast[] = [];
  for (const [date, entry] of dayMap.entries()) {
    if (entry.minTemp != null && entry.maxTemp != null) {
      const sky = entry.skys.length > 0 ? Math.max(...entry.skys) : 1;
      const pty = entry.ptys.find((p) => p > 0) ?? 0;

      const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : undefined;

      daily.push({
        date,
        dayOfWeek: getDayOfWeek(date),
        minTemp: entry.minTemp,
        maxTemp: entry.maxTemp,
        sky,
        precipitationType: pty,
        precipitationProbability: entry.pops.length > 0 ? Math.max(...entry.pops) : undefined,
        avgWindSpeed: entry.wsds.length > 0 ? Math.round(avg(entry.wsds)! * 10) / 10 : undefined,
        avgHumidity: avg(entry.rehs),
      });
    }
  }
  daily.sort((a, b) => a.date.localeCompare(b.date));

  const result: ForecastResult = { hourly, daily };
  setCache(cacheKey, result);
  return result;
}

/** 시간별 예보 (향후 24시간) */
export async function fetchHourlyForecast(
  nx: number, ny: number, signal?: AbortSignal,
): Promise<HourlyForecast[]> {
  const { hourly } = await fetchForecastRaw(nx, ny, signal);
  return hourly;
}

/** 일별 예보 (최대 7일) */
export async function fetchDailyForecast(
  nx: number, ny: number, signal?: AbortSignal,
): Promise<DailyForecast[]> {
  const { daily } = await fetchForecastRaw(nx, ny, signal);
  return daily;
}

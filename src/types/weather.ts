// 기상청 API 공통 응답 구조
export interface WeatherApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      dataType: string;
      items: {
        item: WeatherItem[];
      };
      pageNo: number;
      numOfRows: number;
      totalCount: number;
    };
  };
}

// 개별 데이터 항목
export interface WeatherItem {
  baseDate: string;
  baseTime: string;
  category: string;
  nx: number;
  ny: number;
  obsrValue?: string;
  fcstDate?: string;
  fcstTime?: string;
  fcstValue?: string;
}

// 가공된 현재 날씨 데이터
export interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitationType: number;
  precipitation: string;
}

// 지역 정보
export interface Location {
  name: string;
  nx: number;
  ny: number;
}

// 주요 도시 목록
export const CITIES: Location[] = [
  { name: '서울', nx: 60, ny: 127 },
  { name: '부산', nx: 98, ny: 76 },
  { name: '대구', nx: 89, ny: 90 },
  { name: '인천', nx: 55, ny: 124 },
  { name: '대전', nx: 67, ny: 100 },
  { name: '광주', nx: 58, ny: 74 },
  { name: '제주', nx: 52, ny: 38 },
];

// 강수형태 코드 → 텍스트
export const PTY_TEXT: Record<number, string> = {
  0: '없음',
  1: '비',
  2: '비/눈',
  3: '눈',
  4: '소나기',
};

// 풍향 → 방위
export function getWindDirectionText(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

# 기능 명세 및 API 설계

## 1. 기능 명세

### 1.1 필수 기능 (MVP)

#### F1. 지역 선택

- 주요 도시 드롭다운/버튼으로 빠른 선택 (서울, 부산, 대구, 인천, 대전, 광주, 제주)
- 지역명 텍스트 검색
- 검색 결과 없을 시 안내 메시지 표시

#### F2. 현재 날씨 표시 (초단기실황)

- 지역명
- 기온 (°C)
- 습도 (%)
- 풍속 (m/s) / 풍향
- 강수형태 (없음, 비, 비/눈, 눈, 소나기)
- 1시간 강수량 (mm)

#### F3. 로딩 상태 처리

- API 호출 중 로딩 스피너/스켈레톤 표시
- 사용자에게 데이터 로딩 중임을 시각적으로 안내

#### F4. 에러 상태 처리

- API 호출 실패 시 에러 메시지 표시
- 네트워크 오류, 잘못된 파라미터 등 구분 처리
- 재시도 버튼 제공

#### F5. 로컬 저장소 활용

- 최근 검색한 지역 목록 저장 (최대 5~10개)
- 앱 재실행 시 마지막 검색 지역 자동 조회
- 즐겨찾기 지역 저장/삭제

### 1.2 확장 기능

#### E1. 현재 위치 기반 날씨

- Geolocation API로 현재 위치 좌표(위경도) 획득
- LCC 변환 함수로 격자좌표(nx, ny) 변환
- 좌표 기반 날씨 자동 조회
- 위치 권한 거부 시 기본 지역(서울) 표시

#### E2. 3일 예보 차트 (단기예보)

- 기상청 단기예보 API 활용 (최대 +3일)
- Recharts 라이브러리로 온도 추이 라인 차트 표시
- 일별 최고/최저 기온 (TMX, TMN) 표시
- 하늘상태 아이콘 표시

---

## 2. API 설계

### 2.1 기상청 단기예보 조회서비스

**Base URL:** `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0`

| 오퍼레이션 | 용도 | 비고 |
|------------|------|------|
| `getUltraSrtNcst` | 초단기실황 조회 (현재 날씨) | 매시 정각 발표, +40분 후 조회 가능 |
| `getUltraSrtFcst` | 초단기예보 조회 (6시간) | 매시 30분 발표, +45분 후 조회 가능 |
| `getVilageFcst` | 단기예보 조회 (+3일) [확장] | 1일 8회 발표 (02, 05, 08, 11, 14, 17, 20, 23시) |

### 2.2 공통 요청 파라미터

| 파라미터 | 필수 | 설명 | 예시 |
|---------|------|------|------|
| `serviceKey` | O | 공공데이터포털 디코딩 키 | `VITE_WEATHER_API_KEY` |
| `numOfRows` | O | 한 페이지 결과 수 | `1000` |
| `pageNo` | O | 페이지 번호 | `1` |
| `dataType` | O | 응답 형식 | `JSON` |
| `base_date` | O | 발표일자 (YYYYMMDD) | `20260228` |
| `base_time` | O | 발표시각 (HHmm) | `0600` |
| `nx` | O | 격자 X좌표 | `60` |
| `ny` | O | 격자 Y좌표 | `127` |

### 2.3 카테고리 코드

**초단기실황 (getUltraSrtNcst)**

| 코드 | 의미 | 단위 |
|------|------|------|
| `T1H` | 기온 | °C |
| `RN1` | 1시간 강수량 | mm |
| `REH` | 습도 | % |
| `PTY` | 강수형태 | 코드값 |
| `VEC` | 풍향 | deg |
| `WSD` | 풍속 | m/s |

**단기예보 (getVilageFcst) - 추가 항목**

| 코드 | 의미 | 단위 |
|------|------|------|
| `TMP` | 1시간 기온 | °C |
| `TMN` | 일 최저기온 | °C |
| `TMX` | 일 최고기온 | °C |
| `POP` | 강수확률 | % |
| `SKY` | 하늘상태 | 코드값 |

**코드값 해석**

| 코드 | 값 | 의미 |
|------|-----|------|
| SKY | 1 / 3 / 4 | 맑음 / 구름많음 / 흐림 |
| PTY | 0 / 1 / 2 / 3 / 4 | 없음 / 비 / 비눈 / 눈 / 소나기 |

### 2.4 주요 도시 격자좌표

| 지역 | nx | ny |
|------|----|----|
| 서울 | 60 | 127 |
| 부산 | 98 | 76 |
| 대구 | 89 | 90 |
| 인천 | 55 | 124 |
| 대전 | 67 | 100 |
| 광주 | 58 | 74 |
| 제주 | 52 | 38 |

### 2.5 환경변수 설정

```env
# .env
VITE_WEATHER_API_KEY=발급받은_디코딩_키

# .env.example (커밋용)
VITE_WEATHER_API_KEY=your_api_key_here
```

> Vite는 `VITE_` 접두사가 있는 환경변수만 클라이언트에 노출합니다.

### 2.6 base_time 규칙

초단기실황은 매시 정각 발표 (+40분 후 조회 가능).
단기예보는 1일 8회 발표: `0200`, `0500`, `0800`, `1100`, `1400`, `1700`, `2000`, `2300`

> 현재 시각보다 이전이면서 가장 가까운 발표 시각을 base_time으로 사용.
> 자정~02:10 사이에는 전일 2300 발표분을 사용 (base_date도 전일로 설정).

---

## 3. API 응답 타입 (TypeScript)

```typescript
// 기상청 API 공통 응답 구조
interface WeatherApiResponse {
  response: {
    header: {
      resultCode: string;       // "00" = 정상
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
interface WeatherItem {
  baseDate: string;             // 발표일자
  baseTime: string;             // 발표시각
  category: string;             // 카테고리 코드 (T1H, REH, WSD 등)
  nx: number;                   // 격자 X
  ny: number;                   // 격자 Y
  obsrValue?: string;           // 관측값 (초단기실황)
  fcstDate?: string;            // 예보일자 (예보)
  fcstTime?: string;            // 예보시각 (예보)
  fcstValue?: string;           // 예보값 (예보)
}

// 가공된 현재 날씨 데이터
interface CurrentWeather {
  temperature: number;          // 기온 (T1H)
  humidity: number;             // 습도 (REH)
  windSpeed: number;            // 풍속 (WSD)
  windDirection: number;        // 풍향 (VEC)
  precipitationType: number;    // 강수형태 (PTY)
  precipitation: string;        // 1시간 강수량 (RN1)
}
```

---

## 4. 핵심 코드 패턴 가이드

### 4.1 useEffect 내 비동기 처리 (올바른 패턴)

```typescript
useEffect(() => {
  const controller = new AbortController();

  const fetchWeather = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWeather(nx, ny, controller.signal);
      setData(data);
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  fetchWeather();

  return () => controller.abort(); // cleanup
}, [nx, ny]); // 격자좌표 변경 시 재조회
```

### 4.2 useLocalStorage 훅 패턴

```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue] as const;
}
```

### 4.3 환경변수 접근 (Vite)

```typescript
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
```

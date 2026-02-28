# 기능 명세 및 API 설계

## 1. 기능 명세

### 1.1 필수 기능 (MVP)

#### F1. 도시 검색

- 텍스트 입력으로 도시명 검색
- Enter 키 또는 검색 버튼으로 조회
- 검색 결과 없을 시 안내 메시지 표시

#### F2. 현재 날씨 표시

- 도시명 및 국가 코드
- 현재 온도 (°C)
- 체감 온도
- 날씨 상태 (맑음, 흐림, 비 등) + 아이콘
- 습도 (%)
- 풍속 (m/s)
- 기압 (hPa)

#### F3. 로딩 상태 처리

- API 호출 중 로딩 스피너/스켈레톤 표시
- 사용자에게 데이터 로딩 중임을 시각적으로 안내

#### F4. 에러 상태 처리

- API 호출 실패 시 에러 메시지 표시
- 네트워크 오류, 404 (도시 없음) 등 구분 처리
- 재시도 버튼 제공

#### F5. 로컬 저장소 활용

- 최근 검색한 도시 목록 저장 (최대 5~10개)
- 앱 재실행 시 마지막 검색 도시 자동 조회
- 즐겨찾기 도시 저장/삭제

### 1.2 확장 기능

#### E1. 현재 위치 기반 날씨

- Geolocation API로 현재 위치 좌표 획득
- 좌표 기반 날씨 자동 조회
- 위치 권한 거부 시 기본 도시(서울) 표시

#### E2. 5일 예보 차트

- OpenWeather 5-day forecast API 활용
- Recharts 라이브러리로 온도 추이 라인 차트 표시
- 일별 최고/최저 기온 표시
- 날씨 상태 아이콘 표시

---

## 2. API 설계

### 2.1 OpenWeatherMap API

**Base URL:** `https://api.openweathermap.org/data/2.5`

| 엔드포인트 | 용도 | 파라미터 |
|------------|------|----------|
| `/weather` | 현재 날씨 조회 | `q={city}`, `appid={key}`, `units=metric`, `lang=kr` |
| `/forecast` | 5일 예보 조회 [확장] | `q={city}`, `appid={key}`, `units=metric`, `lang=kr` |
| `/weather` | 좌표 기반 조회 [확장] | `lat={lat}`, `lon={lon}`, `appid={key}`, `units=metric` |

### 2.2 환경변수 설정

```env
# .env
VITE_OPENWEATHER_API_KEY=your_api_key_here

# .env.example (커밋용, 실제 키 없음)
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

> Vite는 `VITE_` 접두사가 있는 환경변수만 클라이언트에 노출합니다.

### 2.3 API 응답 타입 (TypeScript)

```typescript
// types/weather.ts

interface WeatherData {
  name: string;                    // 도시명
  sys: { country: string };        // 국가 코드
  main: {
    temp: number;                  // 현재 온도
    feels_like: number;            // 체감 온도
    humidity: number;              // 습도
    pressure: number;              // 기압
    temp_min: number;              // 최저 온도
    temp_max: number;              // 최고 온도
  };
  weather: Array<{
    id: number;
    main: string;                  // 날씨 상태
    description: string;           // 상세 설명
    icon: string;                  // 아이콘 코드
  }>;
  wind: { speed: number };         // 풍속
  dt: number;                      // 데이터 시간 (Unix)
}

interface ForecastData {
  list: Array<{
    dt: number;
    main: { temp: number; temp_min: number; temp_max: number };
    weather: Array<{ description: string; icon: string }>;
  }>;
}
```

---

## 3. 핵심 코드 패턴 가이드

### 3.1 useEffect 내 비동기 처리 (올바른 패턴)

```typescript
useEffect(() => {
  const controller = new AbortController();

  const fetchWeather = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWeather(city, controller.signal);
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

  if (city) fetchWeather();

  return () => controller.abort(); // cleanup
}, [city]); // 의존성 배열에 city만 포함
```

### 3.2 useLocalStorage 훅 패턴

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

### 3.3 환경변수 접근 (Vite)

```typescript
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
```

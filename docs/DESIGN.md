# 화면 설계 및 아키텍처

## 1. 화면 설계

### 1.1 페이지 구성

단일 페이지 구성 (SPA, 라우팅 없음)

```
┌─────────────────────────────────────────────┐
│  Header (앱 제목 + 현재위치 버튼)            │
├─────────────────────────────────────────────┤
│  LocationSelector (지역 선택/검색)           │
├─────────────────────────────────────────────┤
│  RecentSearches (최근 검색 지역 칩 목록)      │
├──────────────────────┬──────────────────────┤
│                      │                      │
│   CurrentWeather     │   WeatherDetails     │
│   (메인 날씨 카드)    │   (상세 정보 카드)    │
│                      │                      │
├──────────────────────┴──────────────────────┤
│  ForecastChart (3일 예보 차트) [확장]         │
├─────────────────────────────────────────────┤
│  Favorites (즐겨찾기 지역 목록)              │
└─────────────────────────────────────────────┘
```

### 1.2 반응형 대응

| 화면 크기 | 레이아웃 |
|-----------|----------|
| Desktop (≥1024px) | 2열 그리드 (날씨카드 + 상세정보) |
| Tablet (≥768px) | 2열 그리드, 간격 축소 |
| Mobile (<768px) | 1열 스택 레이아웃 |

---

## 2. 프로젝트 구조

```
WeatherDashboard/
├── public/
├── src/
│   ├── api/
│   │   └── weather.ts            # 기상청 API 호출 함수
│   ├── components/
│   │   ├── CurrentWeather.tsx     # 현재 날씨 카드
│   │   ├── ErrorMessage.tsx       # 에러 표시
│   │   ├── Favorites.tsx          # 즐겨찾기 목록
│   │   ├── ForecastChart.tsx      # 3일 예보 차트 [확장]
│   │   ├── Header.tsx             # 헤더
│   │   ├── LoadingSpinner.tsx     # 로딩 표시
│   │   ├── LocationSelector.tsx   # 지역 선택/검색
│   │   ├── RecentSearches.tsx     # 최근 검색 목록
│   │   └── WeatherDetails.tsx     # 상세 날씨 정보
│   ├── hooks/
│   │   ├── useGeolocation.ts      # 현재 위치 훅 [확장]
│   │   ├── useLocalStorage.ts     # 로컬 저장소 훅
│   │   └── useWeather.ts          # 날씨 데이터 페칭 훅
│   ├── types/
│   │   └── weather.ts             # API 응답 타입 정의
│   ├── utils/
│   │   ├── gridConvert.ts         # 위경도 ↔ 격자좌표 변환
│   │   └── debounce.ts            # 디바운스 유틸 [심화]
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 3. 상태 관리

### 3.1 앱 상태 구조

```typescript
// 지역 정보
interface Location {
  name: string;                    // 지역명
  nx: number;                      // 격자 X
  ny: number;                      // 격자 Y
}

// useWeather 훅 반환 상태
interface WeatherState {
  data: CurrentWeather | null;     // 현재 날씨 데이터
  forecast: ForecastItem[] | null; // 예보 데이터 [확장]
  isLoading: boolean;
  error: string | null;
}

// 로컬 저장소 상태
interface LocalState {
  recentSearches: Location[];      // 최근 검색 지역 (최대 10개)
  favorites: Location[];           // 즐겨찾기 지역
  lastLocation: Location;          // 마지막 검색 지역
}
```

### 3.2 상태 관리 전략

| 상태 분류 | 관리 방식 | 예시 |
|-----------|-----------|------|
| **서버 상태** | 커스텀 훅 (`useWeather`) | 날씨 데이터, 예보 데이터 |
| **UI 상태** | 컴포넌트 로컬 state | 검색어, 로딩 표시 |
| **영속 상태** | `useLocalStorage` 훅 | 즐겨찾기, 최근 검색 |

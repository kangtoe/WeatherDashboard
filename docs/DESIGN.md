# 화면 설계 및 아키텍처

## 1. 화면 설계

### 1.1 페이지 구성

단일 페이지 구성 (SPA, 라우팅 없음)

```
┌─────────────────────────────────────────────┐
│  Header (앱 제목 + 현재위치 버튼)            │
├─────────────────────────────────────────────┤
│  SearchBar (도시 검색 입력)                  │
├─────────────────────────────────────────────┤
│  RecentSearches (최근 검색 도시 칩 목록)      │
├──────────────────────┬──────────────────────┤
│                      │                      │
│   CurrentWeather     │   WeatherDetails     │
│   (메인 날씨 카드)    │   (상세 정보 카드)    │
│                      │                      │
├──────────────────────┴──────────────────────┤
│  ForecastChart (5일 예보 차트) [확장]         │
├─────────────────────────────────────────────┤
│  Favorites (즐겨찾기 도시 목록)              │
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
│   │   └── weather.ts          # API 호출 함수
│   ├── components/
│   │   ├── CurrentWeather.tsx   # 현재 날씨 카드
│   │   ├── ErrorMessage.tsx     # 에러 표시
│   │   ├── Favorites.tsx        # 즐겨찾기 목록
│   │   ├── ForecastChart.tsx    # 5일 예보 차트 [확장]
│   │   ├── Header.tsx           # 헤더
│   │   ├── LoadingSpinner.tsx   # 로딩 표시
│   │   ├── RecentSearches.tsx   # 최근 검색 목록
│   │   ├── SearchBar.tsx        # 검색 입력
│   │   └── WeatherDetails.tsx   # 상세 날씨 정보
│   ├── hooks/
│   │   ├── useGeolocation.ts    # 현재 위치 훅 [확장]
│   │   ├── useLocalStorage.ts   # 로컬 저장소 훅
│   │   └── useWeather.ts        # 날씨 데이터 페칭 훅
│   ├── types/
│   │   └── weather.ts           # API 응답 타입 정의
│   ├── utils/
│   │   └── debounce.ts          # 디바운스 유틸 [심화]
│   ├── App.tsx                  # 메인 앱 컴포넌트
│   ├── App.css                  # 앱 스타일 (Tailwind)
│   ├── main.tsx                 # 엔트리 포인트
│   └── vite-env.d.ts            # Vite 타입 선언
├── .env                         # 환경변수 (API 키)
├── .env.example                 # 환경변수 예시 (커밋용)
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
// useWeather 훅 반환 상태
interface WeatherState {
  data: WeatherData | null;        // 날씨 데이터
  forecast: ForecastData | null;   // 예보 데이터 [확장]
  isLoading: boolean;              // 로딩 상태
  error: string | null;            // 에러 메시지
}

// 로컬 저장소 상태
interface LocalState {
  recentSearches: string[];        // 최근 검색 도시 (최대 10개)
  favorites: string[];             // 즐겨찾기 도시
  lastCity: string;                // 마지막 검색 도시
}
```

### 3.2 상태 관리 전략

| 상태 분류 | 관리 방식 | 예시 |
|-----------|-----------|------|
| **서버 상태** | 커스텀 훅 (`useWeather`) | 날씨 데이터, 예보 데이터 |
| **UI 상태** | 컴포넌트 로컬 state | 검색어, 로딩 표시 |
| **영속 상태** | `useLocalStorage` 훅 | 즐겨찾기, 최근 검색 |

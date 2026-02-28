# 구현 로드맵

## Phase 1: 프로젝트 초기 설정

- Vite + React + TypeScript 프로젝트 생성
- Tailwind CSS 설치 및 설정
- 프로젝트 디렉토리 구조 생성
- `.env` 및 `.gitignore` 설정
- 공공데이터포털 기상청 API 키 발급

## Phase 2: 핵심 기능 (MVP)

- API 응답 타입 정의 (`types/weather.ts`)
- 위경도 ↔ 격자좌표 변환 유틸 (`utils/gridConvert.ts`)
- 기상청 API 호출 함수 작성 (`api/weather.ts`)
- `useWeather` 커스텀 훅 구현
- `useLocalStorage` 커스텀 훅 구현
- `LocationSelector` 컴포넌트
- `CurrentWeather` 컴포넌트
- `WeatherDetails` 컴포넌트
- `LoadingSpinner` 컴포넌트
- `ErrorMessage` 컴포넌트
- `App` 컴포넌트 통합

## Phase 3: 로컬 저장소 기능

- 최근 검색 지역 저장/표시
- 즐겨찾기 지역 저장/삭제
- 마지막 검색 지역 자동 로드

## Phase 4: 확장 기능

- 현재 위치 기반 날씨 (`useGeolocation` 훅)
- 단기예보 API 연동 (3일 예보)
- Recharts 차트 컴포넌트

## Phase 5: 심화 학습 적용

- AbortController로 요청 취소 처리
- 검색 입력 Debounce 적용
- 에러 핸들링 고도화

## Phase 6: 마무리

- 반응형 디자인 점검
- 코드 정리 및 주석
- README 업데이트

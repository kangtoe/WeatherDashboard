# Weather Dashboard

기상청 단기예보 API를 활용한 **날씨 대시보드** 프로젝트.
지역 선택, 현재 날씨 표시, 3일 예보 차트, 즐겨찾기 등
API 호출과 비동기 처리 패턴을 직접 구현한다.

## 학습 목표

- fetch/axios를 사용한 외부 API 호출 방법을 익힌다
- async/await 비동기 패턴을 이해하고 적용한다
- 로딩/에러 상태를 분리하여 UX를 개선한다
- useEffect 의존성 배열을 정확히 다룬다
- 환경변수(.env)로 API 키를 안전하게 관리한다
- AbortController, Debounce 등 심화 패턴을 적용한다

## 주요 기능

### 핵심 기능

| 기능 | 설명 |
|------|------|
| **지역 선택** | 주요 도시 선택 또는 지역명 검색으로 날씨 조회 |
| **현재 날씨** | 기온, 습도, 풍속, 강수형태, 하늘상태 표시 |
| **로딩/에러 처리** | API 호출 중 로딩 표시, 실패 시 에러 메시지 및 재시도 버튼 |
| **즐겨찾기** | 즐겨찾기 지역 저장/삭제, LocalStorage 영속화 |
| **최근 검색** | 최근 검색 지역 목록 저장, 앱 재실행 시 자동 복원 |

### 확장 기능

| 기능 | 설명 |
|------|------|
| **현재 위치** | Geolocation API로 현재 좌표 획득 → 격자 변환 → 자동 조회 |
| **3일 예보 차트** | Recharts로 온도 추이 라인 차트, 일별 최고/최저 기온 표시 |

## 기술 스택

| 구분 | 기술 | 선택 이유 |
|------|------|-----------|
| 빌드 도구 | **Vite** | 빠른 HMR, 간결한 설정 |
| UI | **React 19 + TypeScript** | 학습 대상, 타입 안정성 |
| 스타일링 | **Tailwind CSS** | 유틸리티 퍼스트 CSS |
| 외부 API | **기상청 단기예보 API** | 공공데이터포털, 무료 (일 10,000건) |
| 좌표 변환 | **LCC 변환 함수** | GPS 위경도 → 기상청 격자좌표(nx, ny) |
| 저장소 | **LocalStorage** | 별도 백엔드 없이 데이터 영속화 |

## 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env   # 기상청 API 디코딩 키 입력

# 개발 서버
npm run dev

# 빌드
npm run build
```

> API 키는 [공공데이터포털](https://www.data.go.kr/)에서 "기상청_단기예보 조회서비스" 활용신청 후 발급 (디코딩 키 사용)

## 프로젝트 구조

```
src/
├── api/             # API 호출 함수
├── components/      # UI 컴포넌트
│   ├── Header/      # 헤더
│   ├── LocationSelector/  # 지역 선택
│   ├── CurrentWeather/    # 현재 날씨 카드
│   ├── WeatherDetails/    # 상세 정보
│   ├── ForecastChart/     # 3일 예보 차트 [확장]
│   ├── RecentSearches/    # 최근 검색 목록
│   └── Favorites/   # 즐겨찾기
├── hooks/           # useWeather, useLocalStorage, useGeolocation
├── types/           # API 응답 타입 정의
└── utils/           # 좌표 변환, debounce 등 유틸
```

## 관련 문서

- [기능 명세](docs/REQUIREMENTS.md) — 기능 상세, API 설계, 코드 패턴 가이드
- [화면 설계](docs/DESIGN.md) — 와이어프레임, 프로젝트 구조, 상태 관리
- [구현 로드맵](docs/ROADMAP.md) — 단계별 구현 계획

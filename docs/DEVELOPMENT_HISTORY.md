# MySolar Dashboard - Development History & Issue Resolution

## 프로젝트 개요

**프로젝트명**: MySolar Dashboard (Standalone Version)
**목적**: 실시간 태양광 에너지 모니터링 대시보드
**기술 스택**: Next.js 15.5.3, React 19, TypeScript, MQTT, OpenWeatherMap API
**배포**: Vercel

---

## 주요 기능

### 1. 실시간 데이터 모니터링
- **MQTT 연결**: HiveMQ Cloud WebSocket (wss://) 통신
- **데이터 수신 주기**: 30초마다 실시간 업데이트
- **모니터링 항목**:
  - 인버터 상태 (Inverter Status)
  - 배터리 상태 (Battery Status)
  - 태양광 발전 현황 (Solar Overview)
  - 발전기 상태 (Generator Status)

### 2. 환경 모니터링
- **실내 환경 센서** (Indoor Environment):
  - 온도 (Temperature)
  - 습도 (Humidity)
  - MQTT 센서를 통한 실시간 측정

- **외부 날씨 정보** (Outdoor Weather):
  - OpenWeatherMap API 연동
  - 안동시 날씨 정보 (영어 표시)
  - 15분마다 자동 갱신
  - 표시 항목: 온도, 날씨 설명, 풍속, 구름량, 습도, 기압, 체감온도

### 3. 에너지 분석
- 에너지 요약 (Energy Summary)
- 탄소 절감량 (Carbon Savings)
- 알림 패널 (Alerts Panel)

---


### Issue #3: OpenWeatherMap API 통합

**구현 사항**:
- 안동시(Andong-si) 날씨 정보 실시간 표시
- 좌표: 위도 36.5684, 경도 128.7294

**기술적 구현**:

1. **API 라우트 생성** (`app/api/weather/route.ts`):
```typescript
const ANDONG_LAT = 36.5684;
const ANDONG_LON = 128.7294;

export async function GET() {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${ANDONG_LAT}&lon=${ANDONG_LON}&appid=${apiKey}&units=metric`;

  const response = await fetch(url, {
    next: { revalidate: 900 }, // 15분 캐시
  });

  // 데이터 변환 및 반환
}
```

2. **클라이언트 컴포넌트** (`components/dashboard/EnvironmentCard.tsx`):
```typescript
useEffect(() => {
  const fetchWeather = async () => {
    const response = await fetch('/api/weather');
    if (response.ok) {
      const data = await response.json();
      setWeatherData(data);
    }
  };

  fetchWeather();
  const interval = setInterval(fetchWeather, 15 * 60 * 1000); // 15분마다
  return () => clearInterval(interval);
}, []);
```

**최적화 결정**:
- OpenWeatherMap 업데이트 주기: 10분
- 선택한 갱신 주기: 15분
- 이유: 날씨 정보는 급변하지 않으며, API 호출을 적절히 절약하면서도 충분히 최신 정보 제공

**관련 파일**:
- `app/api/weather/route.ts` (새로 생성)
- `components/dashboard/EnvironmentCard.tsx` (수정)
- `OPENWEATHERMAP_SETUP.md` (새로 생성)

---

### Issue #4: 환경 카드 분리 및 UI 개선

**문제 인식**:
- 기존: "Today's Weather" 카드에 센서 데이터(실내)와 날씨 정보(외부)가 혼재
- 사용자 혼란 가능성

**해결 방안**:

1. **카드 분리**:
   - **Indoor Environment**: 실내 센서 데이터 (온도, 습도)
   - **Outdoor Weather**: 외부 날씨 정보 (OpenWeatherMap)

2. **UI 디자인**:

**Indoor Environment Card**:
```typescript
// 녹색 그라데이션 테마
bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50
bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700
```

**Outdoor Weather Card**:
```typescript
// 보라색 그라데이션 테마
bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50
bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700
```

3. **레이아웃 변경**:
```typescript
// Before: 1 + 2 컬럼
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div><EnvironmentCard /></div>
  <div className="lg:col-span-2"><AlertsPanel /></div>
</div>

// After: 1 + 1 + 1 컬럼
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div><IndoorSensorCard /></div>
  <div><EnvironmentCard /></div>
  <div><AlertsPanel /></div>
</div>
```

**관련 파일**:
- `components/dashboard/IndoorSensorCard.tsx` (새로 생성)
- `components/dashboard/EnvironmentCard.tsx` (대폭 수정)
- `app/page.tsx` (레이아웃 수정)

---

### Issue #5: Vercel 빌드 실패

**문제 상황**:
```
Type error: Type '{ data: RealtimeData | null; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'data' does not exist on type 'IntrinsicAttributes'.

./app/page-enhanced.tsx:92:30
```

**원인**:
- 이전 버전의 `page-enhanced.tsx` 파일이 남아있음
- 구버전 `EnvironmentCard` 사용 (data prop 필요)
- 신버전 `EnvironmentCard`는 data prop 불필요 (자체적으로 API 호출)

**해결 방법**:
```bash
rm app/page-enhanced.tsx
git add app/page-enhanced.tsx
git commit -m "fix: Remove obsolete page-enhanced.tsx file"
git push
```

**관련 커밋**:
- `d2ff98d` - Remove obsolete page-enhanced.tsx file

---

### Issue #6: 날씨 데이터 갱신 주기 최적화

**분석 결과**:
- OpenWeatherMap 공식 업데이트 주기: **10분**
- OpenWeatherMap 권장사항: 10분에 1회 이상 호출 금지

**초기 설정**: 30분마다 갱신
- 장점: API 호출 최소화 (~48회/일)
- 단점: 최대 30분 지연 가능

**최종 선택**: 15분마다 갱신
- 장점: 적절한 업데이트 빈도, 충분히 최신 정보
- 단점: API 호출 증가 (~96회/일, 여전히 무료 한도 내)
- Free tier 한도: 1,000,000 회/월

**적용**:
```typescript
// Server-side cache
next: { revalidate: 900 } // 15 minutes

// Client-side refresh
setInterval(fetchWeather, 15 * 60 * 1000) // 15 minutes
```

**관련 커밋**:
- `814ca18` - Optimize weather data refresh interval to 15 minutes

---

## 프로젝트 구조

```
mysolar-dashboard-only/
├── app/
│   ├── api/
│   │   └── weather/
│   │       └── route.ts          # OpenWeatherMap API 라우트
│   └── page.tsx                   # 메인 대시보드 페이지
├── components/
│   └── dashboard/
│       ├── IndoorSensorCard.tsx   # 실내 환경 센서 카드
│       ├── EnvironmentCard.tsx    # 외부 날씨 카드
│       ├── BatteryStatus.tsx
│       ├── GeneratorStatus.tsx
│       ├── InverterStatus.tsx
│       ├── SolarOverview.tsx
│       ├── AlertsPanel.tsx
│       ├── CarbonSavings.tsx
│       ├── EnergySummary.tsx
│       └── ConnectionStatus.tsx
├── lib/
│   └── mqtt.ts                    # MQTT 연결 로직
├── hooks/
│   └── useMQTTData.ts             # MQTT 데이터 훅
├── types/
│   └── solar.ts                   # TypeScript 타입 정의
├── .env                           # 환경 변수 (Vercel)
├── .env.local                     # 환경 변수 (로컬)
├── .env.template                  # 환경 변수 템플릿
├── LOCAL_DEBUG_GUIDE.md           # 로컬 디버깅 가이드
├── OPENWEATHERMAP_SETUP.md        # OpenWeatherMap 설정 가이드
└── DEVELOPMENT_HISTORY.md         # 이 문서
```

---

## 환경 변수 설정

### HiveMQ Cloud MQTT

```env
# Client-side (브라우저에서 접근 가능)
NEXT_PUBLIC_HIVEMQ_HOST=----
NEXT_PUBLIC_HIVEMQ_PORT=8884
NEXT_PUBLIC_HIVEMQ_USERNAME=----
NEXT_PUBLIC_HIVEMQ_PASSWORD="----"

# Server-side (서버에서만 접근 가능)
HIVEMQ_HOST=----
HIVEMQ_PORT=8884
HIVEMQ_USERNAME=----
HIVEMQ_PASSWORD="----"

# MQTT Topics
NEXT_PUBLIC_MQTT_TOPIC_PREFIX=mysolar/
```

### OpenWeatherMap API

```env
OPENWEATHERMAP_API_KEY=----
```

**중요 사항**:
1. 비밀번호에 특수문자(`#`, `&`, `%` 등)가 포함된 경우 반드시 따옴표로 감싸기
2. `.env.local` 파일은 `.env` 파일보다 우선순위가 높음
3. `NEXT_PUBLIC_*` 변수는 클라이언트 사이드에서 접근 가능
4. 환경 변수 변경 후 반드시 개발 서버 재시작 필요

---

## 디버깅 팁

### MQTT 연결 문제

1. **브라우저 콘솔 확인**:
```
=== ENVIRONMENT VARIABLES DEBUG ===
MQTT Config from process.env: {
  NEXT_PUBLIC_HIVEMQ_HOST: '...',
  NEXT_PUBLIC_HIVEMQ_USERNAME: '...',
  NEXT_PUBLIC_HIVEMQ_PASSWORD: '[SET]'
}
```

2. **연결 성공 메시지**:
```
✅ Connected to MQTT broker
✅ Subscribed to topics: solar/inverter/status, solar/environment/data
```

3. **일반적인 에러**:
- Error Code 4: Bad username or password
- Error Code 5: Not authorized (비밀번호 문제)

### 개발 서버 재시작

```bash
# 일반 재시작
npm run dev

# 캐시 클리어 후 재시작
npm run clean
npm run dev

# 또는
npm run dev:clean
```

---

## Git 커밋 이력

### 주요 커밋

1. **918b9c5** - feat: Integrate OpenWeatherMap API and separate indoor/outdoor environment cards
   - OpenWeatherMap API 통합
   - Indoor/Outdoor 카드 분리
   - UI/UX 개선

2. **d2ff98d** - fix: Remove obsolete page-enhanced.tsx file
   - Vercel 빌드 에러 수정

3. **814ca18** - perf: Optimize weather data refresh interval to 15 minutes
   - 날씨 데이터 갱신 주기 최적화

---

## 성능 지표

### API 호출 현황

| Service | 호출 주기 | 일일 호출 | 월간 호출 | Free Tier 한도 |
|---------|----------|----------|----------|---------------|
| MQTT | 30초 | 2,880 | ~86,400 | Unlimited |
| OpenWeatherMap | 15분 | 96 | ~2,880 | 1,000,000 |

### 데이터 전송

- **MQTT 메시지 크기**: ~500 bytes/message
- **일일 데이터 전송량**: ~1.4 MB/day
- **OpenWeatherMap 응답**: ~1 KB/response

---

## 향후 개선 사항

### 단기 (1-2주)
- [ ] 날씨 예보 정보 추가 (5일 예보)
- [ ] 에너지 사용 패턴 그래프
- [ ] 알림 시스템 강화

### 중기 (1-2개월)
- [ ] 데이터베이스 연동 (이력 저장)
- [ ] 사용자 설정 기능
- [ ] 모바일 최적화

### 장기 (3개월+)
- [ ] AI 기반 에너지 사용 최적화 제안
- [ ] 다중 위치 모니터링 지원
- [ ] RESTful API 제공

---

## 참고 문서

### 내부 문서
- [LOCAL_DEBUG_GUIDE.md](./LOCAL_DEBUG_GUIDE.md) - 로컬 환경 디버깅 가이드
- [OPENWEATHERMAP_SETUP.md](./OPENWEATHERMAP_SETUP.md) - OpenWeatherMap API 설정 가이드
- [.env.template](./.env.template) - 환경 변수 템플릿

### 외부 문서
- [Next.js Documentation](https://nextjs.org/docs)
- [HiveMQ Cloud Documentation](https://www.hivemq.com/docs/)
- [OpenWeatherMap API Documentation](https://openweathermap.org/api)
- [MQTT.js Documentation](https://github.com/mqttjs/MQTT.js)

---
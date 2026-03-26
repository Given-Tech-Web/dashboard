# 🌞 MySolar Dashboard - 개발 시스템 완벽 가이드

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택 및 아키텍처](#기술-스택-및-아키텍처)
3. [프로젝트 구조](#프로젝트-구조)
4. [시스템 사양 및 하드웨어](#시스템-사양-및-하드웨어)
5. [개발 워크플로우](#개발-워크플로우)
6. [MQTT 데이터 흐름](#mqtt-데이터-흐름)
7. [컴포넌트 아키텍처](#컴포넌트-아키텍처)
8. [API 및 보안](#api-및-보안)
9. [배포 시스템](#배포-시스템)
10. [성능 최적화](#성능-최적화)
11. [문제 해결](#문제-해결)
12. [향후 개선 사항](#향후-개선-사항)

---

## 프로젝트 개요

### 📖 프로젝트 설명
**MySolar Dashboard**는 GIVENTECH이 개발한 실시간 에너지 관리 시스템(EMS) 모니터링 대시보드입니다. 태양광 발전 시스템, 배터리 저장소, 백업 발전기, 인버터 등을 통합적으로 모니터링하고 제어하는 웹 애플리케이션입니다.

### 🎯 주요 목표
- ✅ 실시간 에너지 모니터링
- ✅ MQTT를 통한 IoT 기기 연동
- ✅ 반응형 웹 디자인
- ✅ Vercel을 통한 자동 배포
- ✅ 보안 강화된 크레덴셜 관리
- ✅ 클라이언트 측 실시간 데이터 처리

### 📊 시스템 규모
| 항목 | 용량 | 상세 |
|------|------|------|
| **태양광(Solar PV)** | 3kW | 500Wp × 6 modules |
| **배터리(Battery)** | 19kWh | 12VDC × 200Ah × 8 sets (48V) |
| **발전기(Generator)** | 6.5kW | 5.5kVA ~ 6.5kVA |
| **인버터(Inverter)** | 5kW | 정격 5kW, 피크 6kW |

---

## 기술 스택 및 아키텍처

### 🔧 핵심 기술 스택

```
Frontend:
├── Next.js 15.5        → Server-side Rendering + Static Generation
├── React 19.1          → UI 컴포넌트 및 상태 관리
├── TypeScript 5.9      → 타입 안정성
├── Tailwind CSS 3.4    → 유틸리티 기반 스타일링
└── Recharts 3.2        → 차트 및 데이터 시각화

Backend/Communication:
├── MQTT.js 5.14        → MQTT 클라이언트 라이브러리
├── Next.js API Routes  → 백엔드 API 엔드포인트
└── WebSocket (WSS)     → 보안 실시간 통신

Infrastructure:
├── Vercel              → 클라우드 배포 플랫폼
├── Node.js             → 런타임 환경
└── npm                 → 패키지 관리자
```

### 🏗️ 애플리케이션 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    브라우저 (클라이언트)                   │
├──────────────────────┬──────────────────────────────────┤
│   React Components   │   State Management (Hooks)       │
│  ├─ Dashboard        │   ├─ useMQTTData()             │
│  ├─ SolarOverview    │   ├─ useClientOnly()           │
│  ├─ BatteryStatus    │   └─ Local Storage             │
│  └─ ... (11개)       │                                  │
└──────────────────────┴──────────────────────────────────┘
           ↓                          ↓
┌──────────────────────────────────────────────────────────┐
│              Next.js App Router (미들웨어)                 │
├──────────────────────────────────────────────────────────┤
│  ├─ /app/page.tsx          → 메인 대시보드               │
│  ├─ /app/layout.tsx        → 루트 레이아웃               │
│  ├─ /app/api/mqtt/config   → 크레덴셜 프록시             │
│  └─ /app/globals.css       → 글로벌 스타일              │
└──────────────────────────────────────────────────────────┘
           ↓                          ↓
┌──────────────────────────────────────────────────────────┐
│           MQTT 클라이언트 (lib/mqtt.ts)                    │
├──────────────────────────────────────────────────────────┤
│  ├─ WebSocket 연결 (WSS)                                │
│  ├─ 자동 재연결 (지수 백오프)                             │
│  ├─ 토픽 구독 관리                                       │
│  ├─ 데이터 변환 (transformToRealtimeData)                │
│  └─ 연결 상태 모니터링                                    │
└──────────────────────────────────────────────────────────┘
           ↓                          ↓
┌──────────────────────────────────────────────────────────┐
│            HiveMQ Cloud (MQTT 브로커)                      │
├──────────────────────────────────────────────────────────┤
│  ├─ solar/inverter/status  → 인버터/배터리/태양광 데이터  │
│  └─ solar/environment/data → 온도/습도 센서 데이터        │
└──────────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────────┐
│           실제 하드웨어 (인버터/센서/기기)                 │
└──────────────────────────────────────────────────────────┘
```

### 🔄 데이터 흐름

```
1. 하드웨어 데이터 생성
   ↓
2. 인버터 → MQTT 브로커에 발행 (Publish)
   ├─ Topic: solar/inverter/status
   ├─ Interval: ~5초
   └─ Format: JSON
   ↓
3. 브라우저 ← MQTT 클라이언트가 구독 (Subscribe)
   ├─ WSS 연결 (WebSocket Secure)
   ├─ 자동 재연결
   └─ 에러 처리
   ↓
4. 데이터 변환 (transformToRealtimeData)
   ├─ MQTT 원시 데이터 → RealtimeData 인터페이스
   ├─ 계산 수행 (효율, 부하율, CO₂ 등)
   └─ 타입 안정성 확보
   ↓
5. React 상태 업데이트
   ├─ setData() → 리렌더링 트리거
   ├─ 영향받는 컴포넌트만 업데이트
   └─ Virtual DOM 최적화
   ↓
6. UI 렌더링
   ├─ 각 패널 컴포넌트 업데이트
   ├─ 애니메이션 적용
   └─ 사용자 화면에 표시
```

---

## 프로젝트 구조

### 📁 디렉토리 레이아웃

```
mysolar-dashboard/
│
├── 📄 README.md                        # 프로젝트 개요
├── 📄 DEVELOPMENT-SYSTEM.md           # 이 문서 (개발 시스템)
├── 📄 DASHBOARD-COMPONENTS-GUIDE.md   # 대시보드 컴포넌트 가이드
├── 📄 README-DEPLOYMENT.md            # 배포 가이드
├── 📄 VERCEL-DEPLOY-GUIDE.md          # Vercel 배포 상세 가이드
├── 📄 VERCEL-ENV-SETUP.md             # Vercel 환경 설정
├── 📄 package.json                    # 패키지 의존성
├── 📄 tsconfig.json                   # TypeScript 설정
├── 📄 tailwind.config.ts              # Tailwind CSS 설정
├── 📄 postcss.config.js               # PostCSS 설정
│
├── 📁 app/                            # Next.js App Router
│   ├── page.tsx                       # 메인 대시보드 페이지
│   ├── layout.tsx                     # 루트 레이아웃 (메타데이터)
│   ├── globals.css                    # 글로벌 스타일
│   └── api/
│       └── mqtt/
│           └── config.ts              # 🔐 MQTT 크레덴셜 프록시
│
├── 📁 components/                     # React 컴포넌트
│   └── dashboard/                     # 대시보드 위젯들
│       ├── GeneratorStatus.tsx        # 6.5kW 발전기 패널
│       ├── BatteryStatus.tsx          # 19kWh 배터리 패널
│       ├── SolarOverview.tsx          # 3kW 태양광 패널
│       ├── InverterStatus.tsx         # 5kW 인버터 패널
│       ├── EnvironmentCard.tsx        # 🌡️ OpenWeatherMap (실외)
│       ├── IndoorSensorCard.tsx       # 🌡️ 실시간 센서 (실내)
│       ├── CarbonSavings.tsx          # CO₂ 절감량 추적
│       ├── EnergySummary.tsx          # 에너지 요약
│       ├── AlertsPanel.tsx            # 시스템 알림
│       ├── ConnectionStatus.tsx       # 연결 상태 표시
│       ├── LoadingOverlay.tsx         # 초기 로딩 오버레이
│       └── EnergyChart*.tsx           # 차트 컴포넌트 (구 버전)
│
├── 📁 hooks/                          # Custom React Hooks
│   ├── useMQTTData.ts                 # 🎣 MQTT 데이터 관리 훅
│   ├── useClientOnly.ts               # 클라이언트 전용 훅
│   └── useMQTTDataEnhanced.ts         # 확장 버전 (미사용)
│
├── 📁 lib/                            # 유틸리티 라이브러리
│   ├── mqtt.ts                        # 🔌 MQTT 클라이언트 서비스
│   ├── env-validator.ts               # 환경변수 검증
│   └── mqtt-client.ts                 # 대체 구현 (미사용)
│
├── 📁 types/                          # TypeScript 타입 정의
│   └── solar.ts                       # 에너지 시스템 인터페이스
│       ├─ RealtimeData                # 메인 데이터 구조
│       ├─ MQTTInverterData            # MQTT 원시 데이터
│       ├─ MQTTEnvironmentData         # 환경 센서 데이터
│       └─ HistoricalData              # 과거 데이터 구조
│
├── 📁 constants/                      # 상수 및 설정
│   └── systemSpecs.ts                 # 🔧 하드웨어 사양
│       ├─ SYSTEM_SPECS                # 모든 사양 정의
│       └─ SystemCalculations          # 계산 함수들
│
├── 📁 utils/                          # 유틸리티 함수 (미사용)
│
├── 📁 public/                         # 정적 파일
│   └── images/
│       └── giventech-logo.png         # 로고
│
├── 📁 .next/                          # Next.js 빌드 결과
│
└── 📁 node_modules/                   # 설치된 패키지들
```

### 📊 컴포넌트 계층 구조

```
RootLayout (layout.tsx)
│
└── DashboardPage (page.tsx)
    │
    ├── Header
    │   ├─ 타이틀 및 설명
    │   ├─ 로고 (giventech-logo.png)
    │   └─ 연결 상태 표시기
    │
    ├── LoadingOverlay (조건부 렌더링)
    │   ├─ 초기 연결 상태 표시
    │   ├─ 재시도 버튼
    │   └─ 진행 상황 메시지
    │
    ├── Main Grid Layout
    │   │
    │   ├─ Row 1: 주요 메트릭 (4열)
    │   │   ├─ InverterStatus (⚡ 5kW 인버터)
    │   │   ├─ BatteryStatus (🔋 19kWh 배터리)
    │   │   ├─ SolarOverview (☀️ 3kW 태양광)
    │   │   └─ GeneratorStatus (🔌 6.5kW 발전기)
    │   │
    │   ├─ Row 2: 환경 및 알림 (3열)
    │   │   ├─ IndoorSensorCard (🌡️ 실시간 센서)
    │   │   ├─ EnvironmentCard (🌤️ 외부 날씨)
    │   │   └─ AlertsPanel (🚨 시스템 알림)
    │   │
    │   └─ Row 3: 요약 및 통계 (2열)
    │       ├─ EnergySummary (⚡ 에너지 요약)
    │       └─ CarbonSavings (🌱 탄소 절감)
    │
    └── Footer
        └─ Copyright 정보
```

---

## 시스템 사양 및 하드웨어

### ⚡ 하드웨어 구성

#### 1️⃣ 태양광 발전 시스템 (Solar PV)
```yaml
용량: 3kW (3000W)
모듈 구성: 500Wp × 6 modules
최대 전압: 48V DC
최대 전류: 62.5A
시스템 효율: 85% (송전 손실 포함)
온도 계수: -0.4%/°C (25°C 기준)
```

**특징:**
- 각 모듈은 500W 정격 전력
- 6개 모듈의 직렬/병렬 구성으로 48V 시스템 형성
- 이상적 조건에서 최대 3000W 출력 가능
- 온도 상승 시 효율 감소

#### 2️⃣ 배터리 저장 시스템 (Battery Bank)
```yaml
총 용량: 19kWh (19,000 Wh)
배터리 사양: 12VDC × 200Ah
구성: 8개 배터리 세트
시스템 전압: 48VDC (12V × 4 직렬 × 2 병렬)
전체 암페어: 400Ah (200Ah × 2 병렬)
최대 충전 전류: 40A
최대 방전 전류: 100A
권장 방전 깊이(DoD): 80%
실제 사용 가능 용량: 15.2kWh (19 × 0.8)
```

**특징:**
- 48V 고전압 시스템으로 송전 손실 최소화
- 400Ah 용량으로 장시간 백업 전력 제공
- 충방전 효율: 95%
- 온도 범위: -10°C ~ 60°C

#### 3️⃣ 백업 발전기 (Generator)
```yaml
최대 전력: 6.5kW (6500W)
정격 용량: 5.5kVA
AC 출력: 220V, 60Hz (한국 표준)
전력 계수: 0.8
연료 소비: 약 2.5L/시간 (만부하 기준)
```

**특징:**
- 배터리 부족 시 자동 시작 (15% 이하)
- 5.5kVA 정격으로 안정적 운영
- 최대 6.5kVA까지 단시간 공급 가능

#### 4️⃣ 인버터 (Inverter)
```yaml
정격 전력: 5kW
최대 전력: 6kW (단시간 피크)
입력 전압 범위: 42V ~ 58V DC
출력 전압: 220V AC
출력 주파수: 60Hz
효율: 94% (정격 부하 기준)
```

**특징:**
- DC를 AC로 변환
- 5kW 이상 부하 발생 시 제한
- 피크 부하 6kW까지 단시간 처리 가능

### 🔢 시스템 계산식

#### 태양광 발전 효율
```javascript
효율(%) = (현재 발전량 ÷ 3000W) × 100

예시:
- 현재 발전량 2000W → 효율 66.7%
- 현재 발전량 3000W → 효율 100%
```

#### 배터리 사용 가능 용량
```javascript
사용 가능 용량 = 19kWh × 권장DoD(80%) = 15.2kWh

충전율 기반 가용 에너지:
에너지(kWh) = 19 × 충전율(%) ÷ 100
```

#### 배터리 런타임
```javascript
런타임(시간) = 사용 가능 용량 ÷ 현재 부하
예: 15.2kWh ÷ 1kW = 15.2 시간
```

#### CO₂ 절감량
```javascript
CO₂ 절감(kg) = 발전량(kWh) × 0.5 kg/kWh

나무 환산:
나무 수 = 총 CO₂ 절감 ÷ 21.77 kg/년/나무
```

#### 인버터 부하율
```javascript
부하율(%) = (출력 전력 ÷ 5000W) × 100

상태 표시:
- 0-40%: 🟢 녹색 (정상)
- 40-60%: 🟡 노란색 (주의)
- 60-80%: 🟠 주황색 (높음)
- 80-100%: 🔴 빨간색 (과부하)
```

### 🚨 시스템 임계값

| 항목 | 임계값 | 의미 |
|------|--------|------|
| **배터리 저** | 20% | 배터리 사용 시간 제한 |
| **배터리 위험** | 10% | 필수 시스템만 작동 |
| **부하 주의** | 80% | 과부하 위험 |
| **부하 과다** | 100% | 인버터 시스템 제한 작동 |
| **태양광 최소** | 50W | 발전 시작 기준 |
| **발전기 시작** | 15% 배터리 | 자동 시작 조건 |

---

## 개발 워크플로우

### 🚀 개발 환경 설정

#### 1단계: 저장소 클론
```bash
git clone https://github.com/utonics/mysolar-dashboard.git
cd mysolar-dashboard
```

#### 2단계: 의존성 설치
```bash
npm install
```

#### 3단계: 환경 변수 설정
```bash
# .env.local 파일 생성
cp .env.example .env.local
```

`.env.local` 파일 내용:
```env
# HiveMQ Cloud 크레덴셜 (서버 측 환경변수)
HIVEMQ_HOST=your-hivemq-host.hivemq.cloud
HIVEMQ_PORT=8884
HIVEMQ_USERNAME=your-username
HIVEMQ_PASSWORD=your-password

# API 보안 키 (선택사항)
API_KEY=your-secure-api-key

# 레거시 호환성 (클라이언트 측 - 구형)
NEXT_PUBLIC_HIVEMQ_HOST=your-hivemq-host.hivemq.cloud
NEXT_PUBLIC_HIVEMQ_PORT=8884
NEXT_PUBLIC_HIVEMQ_USERNAME=your-username
NEXT_PUBLIC_HIVEMQ_PASSWORD=your-password
```

#### 4단계: 개발 서버 시작
```bash
npm run dev
```

개발 서버 접속: http://localhost:3000

### 🔄 개발 주기

#### 1️⃣ 기능 개발
```bash
# 기능 브랜치 생성
git checkout -b feature/새로운-기능

# 코드 수정 및 개발
# - 컴포넌트 추가/수정
# - 로직 구현
# - 스타일 조정

# 개발 서버에서 테스트
npm run dev

# 타입스크립트 오류 확인
npm run build

# 린트 체크
npm run lint
```

#### 2️⃣ 빌드 및 테스트
```bash
# 프로덕션 빌드 테스트
npm run build

# 프로덕션 서버 시작 (로컬)
npm start
```

#### 3️⃣ 커밋 및 푸시
```bash
# 변경사항 스테이징
git add .

# 커밋
git commit -m "feat: 새로운 기능 추가"

# 푸시
git push origin feature/새로운-기능
```

#### 4️⃣ PR 및 병합
```bash
# GitHub에서 Pull Request 생성
# → 코드 리뷰
# → 승인 후 병합

# 로컬 메인 브랜치 업데이트
git checkout main
git pull origin main
```

### 📝 커밋 규칙

Conventional Commits 형식을 따릅니다:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**
- `feat`: 새 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `refactor`: 코드 리팩토링
- `perf`: 성능 최적화
- `test`: 테스트 추가
- `chore`: 빌드/의존성 관리

**Scope:**
- `mqtt`: MQTT 관련
- `component`: 컴포넌트
- `hook`: 커스텀 훅
- `api`: API 엔드포인트
- `ui`: UI/스타일
- `types`: 타입 정의
- `env`: 환경 설정

**예시:**
```bash
git commit -m "feat(component): Add solar efficiency chart"
git commit -m "fix(mqtt): Handle reconnection timeout correctly"
git commit -m "docs: Update DEVELOPMENT-SYSTEM.md"
git commit -m "refactor(lib): Simplify MQTT client initialization"
git commit -m "perf: Optimize component re-renders with useMemo"
```

### 🧪 테스트 프로세스

#### 로컬 테스트
```bash
# 1. 개발 서버에서 수동 테스트
npm run dev

# 2. 브라우저 콘솔 확인
# F12 → Console 탭 확인

# 3. 네트워크 탭 확인
# MQTT 연결 확인
# WebSocket 메시지 흐름 확인

# 4. 반응형 디자인 테스트
# 개발자 도구 → Toggle device toolbar (Ctrl+Shift+M)
# - 모바일 (375px)
# - 태블릿 (768px)
# - 데스크톱 (1024px+)
```

#### 프로덕션 빌드 테스트
```bash
# 1. 프로덕션 빌드
npm run build

# 2. 빌드 결과 확인
ls -la .next/

# 3. 프로덕션 서버 시작
npm start

# 4. 최종 검증
# http://localhost:3000에서 확인
```

---

## MQTT 데이터 흐름

### 📡 MQTT 토픽 구조

#### Topic 1: `solar/inverter/status`
**목적**: 인버터, 태양광, 배터리 상태 데이터

**발행 빈도**: 약 5초마다

**데이터 포맷 (MQTTInverterData)**:
```json
{
  "device_id": "inverter-001",
  "timestamp": "2024-10-21T14:30:45Z",
  "ac_voltage": 220,
  "ac_frequency": 60,
  "output_voltage": 220,
  "output_frequency": 60,
  "output_apparent_power": 2500,
  "output_active_power": 2000,
  "load_percentage": 40,
  "battery_voltage": 48.5,
  "charging_current": 5.2,
  "battery_capacity": 75,
  "pv1_input_current": 25.3,
  "pv1_input_voltage": 48.2,
  "battery_discharge_current": 0,
  "pv1_charging_power": 1215
}
```

**필드 설명**:
- `ac_voltage`: 그리드/발전기 전압
- `output_voltage`: 인버터 출력 전압
- `output_active_power`: 실제 출력 전력 (W)
- `battery_capacity`: 배터리 충전율 (%)
- `pv1_charging_power`: 태양광 발전량 (W)
- `charging_current`: 배터리 충전 전류 (A)
- `battery_discharge_current`: 배터리 방전 전류 (A)

#### Topic 2: `solar/environment/data`
**목적**: 환경 센서 데이터

**발행 빈도**: 약 10초마다

**데이터 포맷 (MQTTEnvironmentData)**:
```json
{
  "device_id": "sensor-001",
  "timestamp": "2024-10-21T14:30:45Z",
  "temperature": 28.5,
  "humidity": 65
}
```

**필드 설명**:
- `temperature`: 현재 온도 (°C)
- `humidity`: 현재 습도 (%)

### 🔄 데이터 변환 과정

#### 변환 함수: `transformToRealtimeData()`

**위치**: `lib/mqtt.ts`

**입력**: MQTT 원시 데이터
```typescript
interface MQTTInverterData {
  // 원시 필드들...
}
```

**출력**: 타입화된 데이터
```typescript
interface RealtimeData {
  device_id: string;
  timestamp: string;
  generator: {
    status: 'running' | 'stopped';
    voltage: number;
    frequency: number;
  };
  battery: {
    capacity_percent: number;
    capacity_kwh: number;
    voltage: number;
    charging_current: number;
    discharge_current: number;
  };
  solar: {
    power_w: number;
    power_kwh: number;
    voltage: number;
    current: number;
    carbon_reduction: number;
  };
  inverter: {
    output_voltage: number;
    output_frequency: number;
    output_power: number;
    load_percentage: number;
  };
  environment?: {
    temperature: number;
    humidity: number;
  };
}
```

**변환 로직**:
```javascript
// 배터리 용량 계산
battery.capacity_kwh = (19 * battery.capacity_percent) / 100

// 태양광 효율 계산
solar.efficiency = (solar.power_w / 3000) * 100

// CO2 절감량 계산
solar.carbon_reduction = solar.power_kwh * 0.5

// 발전기 상태 결정
generator.status = load_percentage > 0 ? 'running' : 'stopped'

// 인버터 부하율 계산
inverter.load_percentage = (output_power / 5000) * 100
```

### 📨 React 상태 업데이트

#### Hook: `useMQTTData()`
**위치**: `hooks/useMQTTData.ts`

**상태 관리**:
```typescript
// 실시간 데이터
const [data, setData] = useState<RealtimeData | null>(null);

// 연결 상태
const [isConnected, setIsConnected] = useState(false);

// 초기 로딩 상태
const [isInitialLoading, setIsInitialLoading] = useState(true);

// 상세 연결 상태
const [connectionStatus, setConnectionStatus] = useState<
  'connecting' | 'waiting' | 'connected' | 'failed'
>('connecting');

// 마지막 업데이트 시간
const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

// 환경 데이터
const [environmentData, setEnvironmentData] = useState<{
  temperature: number;
  humidity: number;
} | null>(null);
```

**구독 설정**:
```typescript
useEffect(() => {
  // Topic 1: solar/inverter/status 구독
  mqttService.subscribe('solar/inverter/status', (inverterData) => {
    const realtimeData = mqttService.transformToRealtimeData(
      inverterData,
      environmentData
    );
    setData(realtimeData);
    setLastUpdate(new Date());
    setIsConnected(true);
    setConnectionStatus('connected');
  });

  // Topic 2: solar/environment/data 구독
  mqttService.subscribe('solar/environment/data', (envData) => {
    setEnvironmentData({
      temperature: envData.temperature,
      humidity: envData.humidity,
    });
  });

  // 연결 상태 주기적 확인
  const connectionCheck = setInterval(() => {
    const connected = mqttService.getConnectionStatus();
    setIsConnected(connected);
  }, 2000);

  // 타임아웃 설정 (60초)
  const connectionTimeout = setTimeout(() => {
    if (isInitialLoading) {
      setConnectionStatus('failed');
      setIsInitialLoading(false);
    }
  }, 60000);
}, []);
```

**타이밍**:
```
0초: 훅 실행, 구독 설정, 상태 'connecting'
10초: 상태 'waiting' (아직 데이터 없음)
30-60초: 첫 메시지 수신, 상태 'connected'
계속: 주기적 메시지 수신 (~5초마다)
```

### ⚠️ 오류 처리

#### 연결 실패 시나리오
```
1. 초기 연결 실패
   → connectionTimeout 60초 경과
   → connectionStatus = 'failed'
   → LoadingOverlay에서 재시도 버튼 표시

2. 연결 끊김
   → mqttService 자동 재연결 (지수 백오프)
   → 최대 5번 재시도
   → 모두 실패 시 연결 상태 업데이트

3. 메시지 구독 실패
   → 해당 토픽 구독 재시도
   → 에러 로그 기록
   → 사용자에게 경고 표시 (예정)
```

---

## 컴포넌트 아키텍처

### 🧩 주요 컴포넌트 분석

#### 1. **SolarOverview** (태양광 발전 패널)
```typescript
// 위치: components/dashboard/SolarOverview.tsx

Props:
- data: RealtimeData  // MQTT에서 수신한 데이터

표시 정보:
├─ Current Power (W)           → data.solar.power_w
├─ Peak Power (W)              → 세션 중 최댓값 추적
├─ Solar Voltage (V)           → data.solar.voltage
├─ Efficiency (%)              → (power_w / 3000) × 100
├─ Power Trend Graph           → 최근 20개 데이터 포인트
└─ Status                       → power_w > 0 ? 'Generating' : 'Idle'
```

**상태 관리**:
```typescript
const [peakPower, setPeakPower] = useState(0);
const [powerHistory, setPowerHistory] = useState<number[]>([]);

useEffect(() => {
  if (!data?.solar?.power_w) return;

  // 최고 전력 추적
  setPeakPower(prev => Math.max(prev, data.solar.power_w));

  // 히스토리 유지 (최대 20개)
  setPowerHistory(prev => [...prev.slice(-19), data.solar.power_w]);
}, [data?.solar?.power_w]);
```

#### 2. **BatteryStatus** (배터리 상태 패널)
```typescript
// 위치: components/dashboard/BatteryStatus.tsx

Props:
- data: RealtimeData

표시 정보:
├─ Capacity (%)                → data.battery.capacity_percent
├─ Available Energy (kWh)      → 19 × capacity% / 100
├─ System Voltage (V)          → data.battery.voltage (48V)
├─ Charging Current (A)        → data.battery.charging_current
├─ Discharging Current (A)     → data.battery.discharge_current
└─ Status                       → 'Charging' | 'Discharging' | 'Idle'

색상 코드:
- 60-100%: 🟢 녹색 (충분)
- 30-60%: 🟡 노란색 (보통)
- 0-30%: 🔴 빨간색 (부족)
```

**상태 판단 로직**:
```typescript
const getStatus = (chargingCurrent: number, dischargeCurrent: number) => {
  if (chargingCurrent > 0) return 'Charging';
  if (dischargeCurrent > 0) return 'Discharging';
  return 'Idle';
};
```

#### 3. **InverterStatus** (인버터 상태 패널)
```typescript
// 위치: components/dashboard/InverterStatus.tsx

Props:
- data: RealtimeData

표시 정보:
├─ Status                      → output_power > 0 ? 'ACTIVE' : 'STANDBY'
├─ Output Power (W)            → data.inverter.output_power
├─ Apparent Power (VA)         → 동일 (PF=1.0 가정)
├─ Load (%)                    → (power / 5000) × 100
├─ Voltage (V)                 → data.inverter.output_voltage
├─ Frequency (Hz)              → data.inverter.output_frequency
└─ Power Factor                → 1.0 (고정)

부하 색상:
- 0-40%: 🟢 녹색
- 40-60%: 🟡 노란색
- 60-80%: 🟠 주황색
- 80-100%: 🔴 빨간색
```

#### 4. **GeneratorStatus** (발전기 상태 패널)
```typescript
// 위치: components/dashboard/GeneratorStatus.tsx

Props:
- data: RealtimeData

표시 정보:
├─ Status                      → 'RUNNING' | 'STOPPED'
├─ AC Voltage (V)              → data.generator.voltage
├─ Frequency (Hz)              → data.generator.frequency
├─ Output Power (W)            → data.inverter.output_power
└─ Load (%)                    → (power / 6500) × 100
```

#### 5. **useMQTTData Hook** (핵심 데이터 관리)
```typescript
// 위치: hooks/useMQTTData.ts

반환 값:
{
  data: RealtimeData | null,           // 최신 MQTT 데이터
  isConnected: boolean,                // 연결 여부
  isInitialLoading: boolean,           // 초기 로딩 중
  connectionStatus: 'connecting' | ..., // 상세 상태
  lastUpdate: Date | null,             // 마지막 업데이트 시간
  reconnect: () => void,               // 수동 재연결 함수
}
```

**사용 예시**:
```typescript
const { data, isConnected, isInitialLoading } = useMQTTData();

if (isInitialLoading) {
  return <LoadingOverlay />;
}

return (
  <div>
    <InverterStatus data={data} />
    <BatteryStatus data={data} />
    {/* ... */}
  </div>
);
```

### 🔄 데이터 흐름 다이어그램

```
MQTT Broker
    ↓
mqtt.ts (서비스)
├─ subscribe()           → 토픽 구독
├─ transformToRealtimeData()  → 데이터 변환
└─ getConnectionStatus()      → 상태 확인
    ↓
useMQTTData Hook
├─ setData()             → 상태 업데이트
├─ setIsConnected()
├─ setConnectionStatus()
└─ setLastUpdate()
    ↓
각 컴포넌트
├─ SolarOverview
├─ BatteryStatus
├─ InverterStatus
├─ GeneratorStatus
├─ EnvironmentCard
└─ ... (총 11개)
    ↓
React Virtual DOM
    ↓
브라우저 렌더링
```

### 🎨 스타일 시스템

#### Tailwind CSS 구조
```typescript
// 레이아웃 클래스
'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4'  // 반응형 그리드

// 색상 클래스
'bg-white'           // 배경
'text-gray-900'      // 텍스트
'border-b'           // 보더

// 상태별 색상
{isConnected ? 'bg-green-500' : 'bg-red-500'}  // 연결 상태

// 애니메이션
'transition-colors'  // 부드러운 색상 변경
'hover:bg-gray-100'  // 호버 상태
```

---

## API 및 보안

### 🔐 보안 강화 아키텍처

#### 문제: MQTT 크레덴셜 노출
```
기존 방식 (위험):
클라이언트 ←→ MQTT 브로커 (크레덴셜 노출)
```

#### 해결책: API 프록시
```
개선된 방식:
클라이언트 ←→ Next.js API Route ←→ MQTT 브로커
              (환경변수 사용)
```

### 📋 API Endpoint: `/api/mqtt/config`

**목적**: MQTT 크레덴셜을 안전하게 전달

**위치**: `app/api/mqtt/config.ts`

**메서드**: GET

**응답**:
```json
{
  "host": "your-hivemq-host.hivemq.cloud",
  "port": 8884,
  "username": "your-username",
  "password": "your-password"
}
```

**보안 기능**:
1. 서버 측 환경변수 사용
   ```typescript
   const host = process.env.HIVEMQ_HOST;
   const port = process.env.HIVEMQ_PORT;
   const username = process.env.HIVEMQ_USERNAME;
   const password = process.env.HIVEMQ_PASSWORD;
   ```

2. 에러 핸들링
   ```typescript
   if (!host || !port || !username || !password) {
     return NextResponse.json(
       { error: 'Missing MQTT configuration' },
       { status: 500 }
     );
   }
   ```

3. CORS 설정 (필요 시)
   ```typescript
   const headers = {
     'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
     'Content-Type': 'application/json',
   };
   ```

### 🔑 환경변수 관리

#### 로컬 개발 (.env.local)
```env
# 서버 측 (클라이언트에 노출 안 됨)
HIVEMQ_HOST=your-host.hivemq.cloud
HIVEMQ_PORT=8884
HIVEMQ_USERNAME=your-username
HIVEMQ_PASSWORD=your-password
API_KEY=optional-api-key

# 클라이언트 측 (NEXT_PUBLIC_ 접두사)
# 주의: 클라이언트에 노출되므로 실제 크레덴셜은 아님
NEXT_PUBLIC_HIVEMQ_HOST=your-host.hivemq.cloud
NEXT_PUBLIC_HIVEMQ_PORT=8884
```

#### 환경변수 검증 (lib/env-validator.ts)
```typescript
export const validateEnv = () => {
  const requiredVars = [
    'HIVEMQ_HOST',
    'HIVEMQ_PORT',
    'HIVEMQ_USERNAME',
    'HIVEMQ_PASSWORD',
  ];

  const missing = requiredVars.filter(
    (varName) => !process.env[varName]
  );

  if (missing.length > 0) {
    console.error(
      `Missing environment variables: ${missing.join(', ')}`
    );
    return false;
  }

  return true;
};
```

### 🛡️ MQTT 보안 설정

#### WebSocket Secure (WSS)
```
연결 방식: wss://host:8884/mqtt
- wss:// → WebSocket over TLS (암호화)
- 8884 → HiveMQ 표준 보안 포트
- 자동 SSL/TLS 인증서 검증
```

#### 자동 재연결 (지수 백오프)
```typescript
// 재연결 시도 간격: 1초, 2초, 4초, 8초, ... (최대 60초)
// 목적: 서버 부하 감소 + 안정성 향상

reconnectPeriod: 1000 * Math.min(2 ** attempt, 60),
```

---

## 배포 시스템

### 🚀 Vercel 배포 프로세스

#### 사전 요구사항
- GitHub 계정
- Vercel 계정 (GitHub와 연동)
- HiveMQ Cloud 계정 및 크레덴셜

#### 단계 1: GitHub 저장소 연동
```bash
# 1. GitHub에 저장소 생성
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

#### 단계 2: Vercel 프로젝트 생성
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. "Add New..." → "Project"
3. GitHub 저장소 선택
4. Import 클릭

#### 단계 3: 환경변수 설정
Vercel Dashboard → Settings → Environment Variables

추가할 변수:
```env
HIVEMQ_HOST=your-hivemq-host.hivemq.cloud
HIVEMQ_PORT=8884
HIVEMQ_USERNAME=your-username
HIVEMQ_PASSWORD=your-password
API_KEY=your-optional-api-key
NEXT_PUBLIC_HIVEMQ_HOST=your-hivemq-host.hivemq.cloud
NEXT_PUBLIC_HIVEMQ_PORT=8884
```

#### 단계 4: 배포 설정
```
Framework: Next.js
Build Command: next build
Output Directory: .next
```

#### 단계 5: 배포 실행
1. Deploy 버튼 클릭
2. 배포 완료 대기 (~3-5분)
3. 배포 URL 확인

### 📊 배포 아티팩트

#### 빌드 결과 구조
```
.next/
├── standalone/          # Vercel 배포용 독립형 서버
├── static/              # 정적 파일 (CSS, JS)
├── cache/               # 빌드 캐시
└── types/               # TypeScript 타입
```

#### 배포 최적화
```
1. 스탠드얼론 모드
   output: 'standalone'  // 최소 크기 번들

2. 압축
   자동 GZIP 압축

3. CDN
   Vercel Edge Network으로 전 세계 배포

4. 캐싱
   정적 파일: 1년 캐시
   동적 콘텐츠: ISR 설정
```

### 📈 배포 후 모니터링

#### Vercel Analytics
```
1. 실시간 모니터링
   - 방문자 수
   - 페이지 로드 시간
   - 에러 발생률

2. Web Vitals
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)
```

#### MQTT 연결 모니터링
```javascript
// 브라우저 콘솔에서 확인
console.log('MQTT Status:', isConnected);
console.log('Last Update:', lastUpdate);
console.log('Connection Status:', connectionStatus);
```

### 🔄 지속적 배포 (CI/CD)

#### GitHub Actions (자동 배포)
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

#### 자동 배포 워크플로우
```
git push main
    ↓
GitHub Actions 트리거
    ↓
npm ci (의존성 설치)
    ↓
npm run build (빌드)
    ↓
npm run lint (린트 체크)
    ↓
Vercel에 업로드
    ↓
배포 완료
    ↓
자동 테스트 (선택사항)
```

---

## 성능 최적화

### ⚡ 최적화 전략

#### 1. 코드 분할 (Code Splitting)
```typescript
// 동적 import로 컴포넌트 로딩 지연
const EnergyChart = dynamic(
  () => import('./EnergyChart'),
  { loading: () => <LoadingSpinner /> }
);
```

#### 2. 메모이제이션 (Memoization)
```typescript
// 불필요한 리렌더링 방지
const SolarOverview = React.memo(function SolarOverview({ data }) {
  return (/* ... */);
});
```

#### 3. 상태 최적화
```typescript
// 필요한 데이터만 구독
const { data, isConnected } = useMQTTData({
  deviceId: 'inverter-001'
});
```

### 📊 성능 지표

#### Lighthouse 점수 목표
- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 90
- **SEO**: > 95

#### Core Web Vitals
| 지표 | 목표값 | 현재값 |
|------|--------|--------|
| LCP | < 2.5s | - |
| FID | < 100ms | - |
| CLS | < 0.1 | - |

#### 번들 크기 최적화
```
목표: < 500KB (초기 로드)

분석 도구:
npm install -g next-bundle-analyzer

사용:
ANALYZE=true npm run build
```

### 🔄 캐싱 전략

#### 클라이언트 캐싱
```typescript
// localStorage 캐싱 (향후 구현)
const cacheKey = `solar-data-${new Date().toDateString()}`;
localStorage.setItem(cacheKey, JSON.stringify(data));
```

#### 서버 캐싱
```
정적 페이지: 60초 캐시
동적 페이지: 1초 캐시
API 응답: 요청마다 최신 데이터
```

---

## 문제 해결

### 🐛 일반적인 문제

#### 문제 1: MQTT 연결 실패
```
증상:
- "Disconnected" 상태 표시
- 데이터 없음
- 빨간 점 아이콘

해결책:
1. 환경변수 확인
   cat .env.local | grep HIVEMQ

2. HiveMQ Cloud 대시보드 확인
   - 프로젝트 활성 상태
   - 크레덴셜 정확성
   - IP 화이트리스트 확인

3. 네트워크 확인
   - VPN 비활성화
   - 방화벽 확인
   - 포트 8884 개방 확인

4. 로컬 테스트
   npm run dev
   브라우저 F12 → Console 확인
```

#### 문제 2: 타입 오류
```
오류:
TS2339: Property 'xxx' does not exist on type 'RealtimeData'

원인:
- types/solar.ts에서 인터페이스 정의 누락
- 데이터 변환 함수에서 누락된 필드

해결책:
1. types/solar.ts 확인
   export interface RealtimeData {
     // 필요한 모든 필드 확인
   }

2. 변환 함수 확인
   lib/mqtt.ts → transformToRealtimeData()

3. 타입 검사
   npm run build
```

#### 문제 3: 빌드 실패
```
오류:
error: Function stale-while-revalidate requires ISR or revalidatePath

원인:
- Next.js 15.x와의 호환성 문제

해결책:
1. 캐시 삭제
   npm run clean

2. 의존성 재설치
   rm -rf node_modules package-lock.json
   npm install

3. 빌드 재시도
   npm run build
```

### 🔍 디버깅 팁

#### 브라우저 콘솔 로그
```javascript
// MQTT 데이터 확인
console.log('Received data:', data);
console.log('Connection status:', isConnected);
console.log('Last update:', lastUpdate);

// Network 탭
// F12 → Network → Filter: 'wss'
// WebSocket 메시지 흐름 확인
```

#### 로컬 개발 서버 로그
```
[연결 시작]
next dev

[MQTT 연결 로그]
console 확인 → 구독 이벤트 확인

[데이터 수신 로그]
transformToRealtimeData 함수 내 console.log 확인
```

#### 배포 후 모니터링
```
Vercel Dashboard → Deployments → 로그 확인
├─ Build logs (빌드 오류)
├─ Runtime logs (실행 오류)
└─ Error reporting (사용자 오류)
```

---

## 향후 개선 사항

### 🔮 계획된 기능

#### Phase 2: 데이터 히스토리
```typescript
// 목표: 과거 데이터 저장 및 조회

구현:
├─ Vercel KV (Redis) 연동
├─ 시간별 데이터 집계
├─ 차트 라이브러리 통합
└─ 필터링 및 내보내기

예상 시간: 2-3주
```

#### Phase 3: 실시간 알림
```typescript
// 목표: 임계값 기반 알림

구현:
├─ 배터리 저 경고
├─ 부하 과다 경고
├─ 발전기 시작 알림
└─ 푸시 알림 (선택사항)

예상 시간: 1-2주
```

#### Phase 4: 사용자 설정
```typescript
// 목표: 커스터마이징 지원

구현:
├─ 대시보드 레이아웃 저장
├─ 임계값 커스터마이징
├─ 테마 선택 (라이트/다크)
└─ 언어 설정 (i18n)

예상 시간: 2-3주
```

#### Phase 5: 보고서 생성
```typescript
// 목표: 일일/월별 보고서

구현:
├─ PDF 내보내기
├─ 에너지 분석
├─ 효율 분석
└─ CO₂ 절감량 리포트

예상 시간: 2주
```

### 📋 기술 부채 제거

#### 1. 컴포넌트 리팩토링
```
현재 상태: 각 컴포넌트가 props를 직접 처리

개선:
- 컴포넌트 역할 분리
- 복잡한 로직 추출
- 재사용 가능한 컴포넌트화

예상 시간: 1주
```

#### 2. 타입 정의 강화
```
현재 상태: 기본 타입만 정의

개선:
- 모든 Props 타입 정의
- 에러 타입 정의
- API 응답 타입 정의

예상 시간: 3일
```

#### 3. 테스트 추가
```
현재 상태: 테스트 없음

개선:
- Jest 및 React Testing Library
- 단위 테스트 (최소 80% 커버)
- E2E 테스트 (Cypress)

예상 시간: 2주
```

### 🚀 성능 개선

#### 1. 캐싱 전략
```
구현:
- localStorage로 당일 데이터 캐싱
- IndexedDB로 장기 히스토리 저장
- 네트워크 요청 최소화

예상 시간: 1주
```

#### 2. 번들 최적화
```
구현:
- Tree shaking
- 라이브러리 최소화
- 이미지 최적화

목표: < 300KB (초기 로드)
```

---

## 결론

### 📌 핵심 요점

1. **아키텍처**: 모던 Next.js + React 기반의 실시간 모니터링 대시보드
2. **통신**: MQTT over WebSocket으로 IoT 기기와 연동
3. **보안**: API 프록시를 통한 크레덴셜 보호
4. **배포**: Vercel을 통한 자동 배포 및 CDN 제공
5. **확장성**: 모듈화된 구조로 향후 기능 추가 용이

### 🎯 개발 원칙

- ✅ 타입 안정성 (TypeScript)
- ✅ 성능 최우선 (최적화)
- ✅ 사용자 경험 (반응형 디자인)
- ✅ 보안 강화 (크레덴셜 보호)
- ✅ 유지보수 용이 (명확한 구조)

### 📚 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 공식 문서](https://react.dev)
- [MQTT 프로토콜](https://mqtt.org)
- [HiveMQ Cloud](https://www.hivemq.com/cloud/)
- [Vercel 배포 가이드](https://vercel.com/docs)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)

---

## 프로젝트 정보

| 항목 | 내용 |
|------|------|
| **프로젝트명** | MySolar Dashboard |
| **시스템명** | GIVENTECH EMS (Energy Management System) |
| **의뢰회사** | GIVENTECH |
| **개발회사** | UTONICS |
| **문서 작성일** | 2025년 10월 21일 |
| **최종 수정일** | 2025년 10월 21일 |
| **버전** | 1.0.0 |
| **작성자** | Claude AI (Claude Code) / UTONICS 개발팀 |

---

*이 문서는 프로젝트 개발 및 유지보수를 위한 종합 가이드입니다. 정기적으로 업데이트하세요.*

**Developed by UTONICS** | **Commissioned by GIVENTECH** | **© 2025**

# 🌞 Giventech Solar Dashboard

실시간 태양광 에너지 모니터링 대시보드 - Giventech 솔루션


## ⚡ 시스템 사양

| 구성요소 | 용량 | 상세 사양 |
|---------|------|----------|
| **☀️ Solar PV** | **3kW** | 500Wp × 6 modules |
| **🔋 Battery** | **19kWh** | 12VDC × 200Ah × 8 sets (48V 시스템) |
| **⚡ Generator** | **6.5kW** | 5.5kVA ~ 6.5kVA |
| **🔄 Inverter** | **5kW** | 정격 5kW, 피크 6kW |

## ✨ 주요 기능

### 모니터링 기능
- 🔋 **실시간 모니터링**: 3kW 태양광, 19kWh 배터리, 5kW 인버터 상태 추적
- 📊 **효율 계산**: 실제 시스템 용량 기반 정확한 효율 표시
- 🌡️ **환경 모니터링**: 온도, 습도 등 환경 데이터 표시
- ⚡ **발전기 상태**: 6.5kW 백업 발전기 모니터링
- 🌱 **CO₂ 절감량**: 실시간 탄소 절감량 계산

### 기술적 특징
- 🔒 **보안 강화**: API Route를 통한 MQTT 크레덴셜 보호
- 🔄 **자동 재연결**: 지수 백오프를 활용한 스마트 재연결
- 📱 **반응형 디자인**: 모바일/태블릿/데스크톱 완벽 지원
- ⏱️ **실시간 업데이트**: WebSocket 기반 실시간 데이터 스트리밍

## 로컬 개발

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`를 `.env`로 복사하고 HiveMQ 설정을 입력:

```bash
cp .env.example .env
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 🌐 Vercel 배포

### 자동 배포 (GitHub 연동) - 권장

1. GitHub에 푸시:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. [Vercel Dashboard](https://vercel.com)에 로그인
3. "Import Git Repository" 선택
4. `https://github.com/utonics/giventech-dashboard` 연결
5. 환경변수 설정:
   - `HIVEMQ_HOST` (보안 강화)
   - `HIVEMQ_PORT`
   - `HIVEMQ_USERNAME`
   - `HIVEMQ_PASSWORD`
   - `NEXT_PUBLIC_HIVEMQ_HOST` (레거시 호환)
   - `NEXT_PUBLIC_HIVEMQ_PORT`
   - `NEXT_PUBLIC_HIVEMQ_USERNAME`
   - `NEXT_PUBLIC_HIVEMQ_PASSWORD`
6. Deploy 클릭

### 수동 배포 (Vercel CLI)

```bash
npm i -g vercel
vercel
```

## 🔧 기술 스택

- **Framework**: Next.js 15.5 (App Router)
- **언어**: TypeScript 5.9
- **스타일링**: Tailwind CSS 3.4
- **실시간 통신**: MQTT.js over WebSocket (WSS)
- **차트**: Custom SVG Charts
- **상태 관리**: React Hooks
- **배포**: Vercel (Standalone Output)

## 📁 프로젝트 구조

```
mysolar-dashboard/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── mqtt/         # MQTT 보안 설정
│   ├── layout.tsx        # 루트 레이아웃
│   └── page.tsx          # 메인 대시보드
├── components/            # React 컴포넌트
│   └── dashboard/        # 대시보드 위젯
│       ├── GeneratorStatus.tsx    # 6.5kW 발전기
│       ├── BatteryStatus.tsx      # 19kWh 배터리
│       ├── SolarOverview.tsx      # 3kW 태양광
│       ├── InverterStatus.tsx     # 5kW 인버터
│       └── ...
├── constants/            # 시스템 상수
│   └── systemSpecs.ts   # 하드웨어 사양
├── hooks/                # Custom Hooks
│   ├── useMQTTData.ts
│   └── useClientOnly.ts
├── lib/                  # 유틸리티
│   └── mqtt.ts          # MQTT 클라이언트
└── types/               # TypeScript 타입
    └── solar.ts
```

## 📡 MQTT 데이터 구조

### 토픽
- `solar/inverter/status` - 인버터 및 시스템 상태
- `solar/environment/data` - 환경 센서 데이터

### 주요 계산식
- **태양광 효율**: `(현재 발전량 ÷ 3000W) × 100%`
- **배터리 용량**: `19kWh × 충전율%`
- **발전기 부하**: `(출력 전력 ÷ 6500W) × 100%`
- **CO₂ 절감량**: `발전량(kWh) × 0.5 kg`

## 🔐 보안

- API Route를 통한 MQTT 크레덴셜 보호
- 서버 측 환경변수 관리
- WebSocket over TLS (wss://) 사용
- 환경변수 자동 검증

## 🤝 기여하기

프로젝트 개선에 참여하고 싶으시다면 PR을 보내주세요!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

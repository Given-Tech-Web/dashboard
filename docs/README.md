# 📚 MySolar Dashboard - 문서 센터

> 🌞 GIVENTECH EMS 실시간 모니터링 대시보드 프로젝트 문서

## 📖 문서 목차

### 🚀 시작하기
- **[DEVELOPMENT-SYSTEM.md](./DEVELOPMENT-SYSTEM.md)** ⭐ **필수 읽기**
  - 프로젝트 전체 개요 및 아키텍처
  - 기술 스택 상세 설명
  - 개발 환경 설정 방법
  - 배포 및 성능 최적화
  - 1,574줄의 종합 가이드

### 🔧 개발 가이드

#### 컴포넌트 개발
- **[DASHBOARD-COMPONENTS-GUIDE.md](./DASHBOARD-COMPONENTS-GUIDE.md)**
  - 11개 대시보드 컴포넌트 상세 설명
  - 각 패널의 역할 및 기능
  - 데이터 출처 및 계산식
  - 실시간 데이터 구조

#### 디버깅 및 로컬 개발
- **[LOCAL_DEBUG_GUIDE.md](./LOCAL_DEBUG_GUIDE.md)**
  - 로컬 환경 디버깅 팁
  - 네트워크 모니터링
  - 콘솔 로그 활용법
  - 일반적인 오류 해결

#### 환경 설정
- **[OPENWEATHERMAP_SETUP.md](./OPENWEATHERMAP_SETUP.md)**
  - OpenWeatherMap API 통합
  - 외부 날씨 데이터 연동
  - API 키 설정 방법

### 🌐 배포 가이드

#### Vercel 배포
- **[VERCEL-DEPLOY-GUIDE.md](./VERCEL-DEPLOY-GUIDE.md)** ⭐ **배포 필독**
  - Vercel 자동 배포 단계별 가이드
  - GitHub 연동 설정
  - 배포 후 모니터링

- **[VERCEL-ENV-SETUP.md](./VERCEL-ENV-SETUP.md)**
  - Vercel 환경변수 설정
  - MQTT 크레덴셜 구성
  - 보안 설정

#### 일반 배포
- **[README-DEPLOYMENT.md](./README-DEPLOYMENT.md)**
  - 배포 개요
  - CLI를 통한 수동 배포
  - 향후 개선 사항

### 📋 프로젝트 히스토리
- **[DEVELOPMENT_HISTORY.md](./DEVELOPMENT_HISTORY.md)**
  - 개발 과정 및 주요 이슈
  - 해결된 문제들
  - 성능 최적화 기록

---

## 🎯 빠른 시작

### 1️⃣ 새로운 개발자인 경우
```bash
# 이 순서로 문서 읽기
1. DEVELOPMENT-SYSTEM.md (전체 이해)
2. LOCAL_DEBUG_GUIDE.md (로컬 환경 설정)
3. DASHBOARD-COMPONENTS-GUIDE.md (컴포넌트 이해)
```

### 2️⃣ 기능 개발하는 경우
```bash
# 참고할 문서
1. DEVELOPMENT-SYSTEM.md → "개발 워크플로우" 섹션
2. DASHBOARD-COMPONENTS-GUIDE.md → 해당 컴포넌트
3. LOCAL_DEBUG_GUIDE.md → 디버깅
```

### 3️⃣ 배포하는 경우
```bash
# 배포 문서
1. VERCEL-DEPLOY-GUIDE.md (자동 배포 권장)
2. VERCEL-ENV-SETUP.md (환경변수 설정)
3. README-DEPLOYMENT.md (추가 정보)
```

### 4️⃣ 외부 API 연동하는 경우
```bash
# API 관련 문서
1. OPENWEATHERMAP_SETUP.md (날씨 API)
2. DEVELOPMENT-SYSTEM.md → "API 및 보안" 섹션
```

---

## 📊 시스템 사양 요약

| 항목 | 용량 | 상세 |
|------|------|------|
| **태양광(Solar PV)** | 3kW | 500Wp × 6 modules |
| **배터리(Battery)** | 19kWh | 12VDC × 200Ah × 8 sets (48V) |
| **발전기(Generator)** | 6.5kW | 5.5kVA ~ 6.5kVA |
| **인버터(Inverter)** | 5kW | 정격 5kW, 피크 6kW |

---

## 🔧 기술 스택

### Frontend
- Next.js 15.5
- React 19.1
- TypeScript 5.9
- Tailwind CSS 3.4
- Recharts 3.2

### Backend/Communication
- MQTT.js 5.14
- Next.js API Routes
- WebSocket (WSS)

### Infrastructure
- Vercel (배포)
- HiveMQ Cloud (MQTT 브로커)

---

## 🔐 보안 정보

### MQTT 크레덴셜 관리
- ✅ API 프록시를 통한 크레덴셜 보호
- ✅ 서버 측 환경변수 관리
- ✅ WebSocket over TLS (WSS) 사용
- ✅ 자동 재연결 및 에러 처리

**관련 문서**: `DEVELOPMENT-SYSTEM.md` → "API 및 보안" 섹션

---

## 📱 프로젝트 구조

```
mysolar-dashboard/
├── 📁 docs/                    # 📍 문서 폴더 (이 폴더)
│   ├── README.md              # 문서 목차 (이 파일)
│   ├── DEVELOPMENT-SYSTEM.md  # 종합 개발 가이드
│   ├── DASHBOARD-COMPONENTS-GUIDE.md
│   ├── DEVELOPMENT_HISTORY.md
│   ├── LOCAL_DEBUG_GUIDE.md
│   ├── OPENWEATHERMAP_SETUP.md
│   ├── README-DEPLOYMENT.md
│   ├── VERCEL-DEPLOY-GUIDE.md
│   └── VERCEL-ENV-SETUP.md
│
├── 📄 README.md               # 프로젝트 기본 개요
├── 📄 package.json
├── 📄 tsconfig.json
├── 📁 app/                    # Next.js App Router
├── 📁 components/             # React 컴포넌트 (11개)
├── 📁 hooks/                  # Custom Hooks
├── 📁 lib/                    # 유틸리티 라이브러리
├── 📁 types/                  # TypeScript 타입
├── 📁 constants/              # 상수 및 설정
└── 📁 public/                 # 정적 파일
```

---

## 🚀 주요 명령어

### 개발
```bash
npm install          # 의존성 설치
npm run dev         # 개발 서버 시작 (http://localhost:3000)
npm run build       # 프로덕션 빌드
npm start           # 프로덕션 서버 시작
npm run lint        # 린트 체크
npm run clean       # 캐시 삭제
npm run clean:all   # 전체 삭제 및 재설치
npm run dev:clean   # 캐시 삭제 후 개발 서버 시작
```

### Git
```bash
git add .
git commit -m "feat: 새로운 기능"  # Conventional Commits
git push origin main
```

---

## 📞 문제 해결

### 자주 묻는 질문 (FAQ)

**Q: MQTT 연결이 안 돼요.**
> A: `DEVELOPMENT-SYSTEM.md` → "문제 해결" → "문제 1: MQTT 연결 실패" 참고

**Q: 타입 오류가 발생해요.**
> A: `DEVELOPMENT-SYSTEM.md` → "문제 해결" → "문제 2: 타입 오류" 참고

**Q: 빌드가 실패해요.**
> A: `DEVELOPMENT-SYSTEM.md` → "문제 해결" → "문제 3: 빌드 실패" 참고

**Q: 환경변수를 어디에 설정하나요?**
> A: `VERCEL-ENV-SETUP.md` 또는 `DEVELOPMENT-SYSTEM.md` → "API 및 보안" 참고

---

## 🔄 문서 버전 관리

| 버전 | 날짜 | 주요 변경사항 |
|------|------|------------|
| 1.0.0 | 2025-10-21 | 초기 문서 작성 |
| - | - | - |

---

## 📚 외부 참고 자료

### 공식 문서
- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 공식 문서](https://react.dev)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)

### MQTT & 통신
- [MQTT 프로토콜](https://mqtt.org)
- [HiveMQ Cloud](https://www.hivemq.com/cloud/)
- [MQTT.js 라이브러리](https://github.com/mqttjs/MQTT.js)

### 배포 & 인프라
- [Vercel 공식 문서](https://vercel.com/docs)
- [Vercel Next.js 배포 가이드](https://vercel.com/docs/concepts/next.js/overview)
- [GitHub Actions](https://github.com/features/actions)

---

## 💡 팁

✅ **모든 문서는 마크다운 형식**이므로 GitHub에서 바로 읽을 수 있습니다.

✅ **목차 링크**를 클릭하면 해당 섹션으로 이동합니다.

✅ **코드 예제**는 복사-붙여넣기로 바로 사용 가능합니다.

✅ **정기적으로 문서를 업데이트**하여 최신 상태 유지하세요.

---

## 📝 문서 작성 가이드

새 문서를 추가할 때는:

1. **파일명**: UPPERCASE로 작성 (예: `FEATURE_NAME.md`)
2. **제목**: H1 헤더 (`# `)로 시작
3. **구조**: 목차 → 상세 내용 → 예제 → 결론
4. **예제**: 코드 블록 사용 (언어 지정)
5. **링크**: 다른 문서 참조 시 상대 경로 사용

---

## ✨ 문서 기여하기

문서 개선 사항이 있으면:

1. 해당 파일 수정
2. 커밋: `docs: Update [filename]`
3. PR 생성
4. 리뷰 후 병합

---

## 👥 프로젝트 정보

| 항목 | 정보 |
|------|------|
| **프로젝트명** | MySolar Dashboard |
| **의뢰회사** | GIVENTECH |
| **개발회사** | UTONICS |
| **시스템명** | EMS (Energy Management System) |
| **최종 업데이트** | 2025년 10월 21일 |

---

<div align="center">

### 📖 Happy Reading! 🎉

이 문서들이 프로젝트 개발에 도움이 되길 바랍니다.

질문이나 개선 사항이 있으면 [Issues](../../issues)에 등록해주세요.

**Developed by UTONICS** | **Commissioned by GIVENTECH**

</div>

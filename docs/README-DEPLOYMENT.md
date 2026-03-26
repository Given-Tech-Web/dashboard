# MySolar Dashboard - Vercel 배포 가이드

## 🚀 개선사항 완료

### ✅ 구현된 기능

1. **보안 강화된 MQTT 연결**
   - API Route를 통한 크레덴셜 프록시 (`/api/mqtt/config`)
   - 서버 측에서만 관리되는 환경변수
   - 클라이언트 노출 최소화

2. **향상된 연결 관리**
   - 지수 백오프를 활용한 자동 재연결
   - 실시간 연결 상태 모니터링 UI
   - 사용자 친화적 에러 메시지
   - 수동 재연결 기능

3. **데이터 히스토리 저장**
   - 최근 24시간 데이터 localStorage 저장
   - 1시간/6시간/24시간 범위 선택
   - 태양광/배터리/부하 메트릭 전환
   - 실시간 차트 업데이트

4. **환경변수 검증**
   - 런타임 환경변수 자동 검증
   - 개발/프로덕션 환경 구분
   - 보안 경고 시스템

## 📦 Vercel 배포 단계

### 1. Vercel CLI 설치 (선택사항)
```bash
npm i -g vercel
```

### 2. 환경변수 설정

#### Vercel Dashboard에서 설정:
1. [Vercel Dashboard](https://vercel.com) 접속
2. 프로젝트 선택 → Settings → Environment Variables
3. 다음 변수 추가:

```env
# 보안 강화된 서버 측 변수 (권장)
HIVEMQ_HOST=your-hivemq-host.hivemq.cloud
HIVEMQ_PORT=8884
HIVEMQ_USERNAME=your-username
HIVEMQ_PASSWORD=your-password
API_KEY=your-secure-api-key  # 선택사항

# 레거시 호환성 (임시)
NEXT_PUBLIC_HIVEMQ_HOST=your-hivemq-host.hivemq.cloud
NEXT_PUBLIC_HIVEMQ_PORT=8884
NEXT_PUBLIC_HIVEMQ_USERNAME=your-username
NEXT_PUBLIC_HIVEMQ_PASSWORD=your-password
```

### 3. 배포 실행

#### 옵션 A: Vercel CLI 사용
```bash
vercel
```

#### 옵션 B: GitHub 연동
1. GitHub 레포지토리에 코드 푸시
2. Vercel Dashboard에서 "Import Git Repository"
3. 자동 배포 설정

### 4. 배포 확인
- 배포 URL 접속
- 연결 상태 확인
- 실시간 데이터 수신 확인

## 🔧 향후 개선 가능 사항

### 1. Vercel KV 연동 (선택사항)
```bash
# Vercel KV 추가
vercel env add VERCEL_KV_URL
vercel env add VERCEL_KV_REST_API_URL
vercel env add VERCEL_KV_REST_API_TOKEN
vercel env add VERCEL_KV_REST_API_READ_ONLY_TOKEN
```

### 2. 추가 보안 강화
- JWT 토큰 기반 인증
- Rate limiting
- CORS 설정

### 3. 성능 최적화
- Edge Functions 활용
- ISR (Incremental Static Regeneration)
- 이미지 최적화

## 🐛 문제 해결

### MQTT 연결 실패
1. 환경변수 확인
2. HiveMQ Cloud 대시보드에서 크레덴셜 확인
3. 네트워크/방화벽 설정 확인

### 빌드 오류
```bash
# 로컬에서 빌드 테스트
npm run build
```

### 런타임 오류
- Vercel Functions 로그 확인
- 브라우저 콘솔 확인

## 📊 모니터링

### Vercel Analytics
- Real User Monitoring
- Web Vitals 추적
- 에러 모니터링

### 커스텀 모니터링
- MQTT 연결 상태 로깅
- 데이터 수신 빈도 추적
- 에러 발생률 모니터링

## 🔗 유용한 링크
- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [HiveMQ Cloud](https://www.hivemq.com/cloud/)

## 💡 팁
- 프로덕션 환경에서는 API_KEY 설정 권장
- 정기적인 환경변수 로테이션
- 모니터링 대시보드 활용
- 배포 전 로컬 테스트 필수
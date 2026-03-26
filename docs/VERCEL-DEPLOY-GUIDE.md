# 🚀 Vercel 배포 가이드

## ✅ GitHub 푸시 완료!

코드가 성공적으로 GitHub에 업로드되었습니다:
👉 https://github.com/utonics/mysolar-dahboard

## 📝 Vercel 배포 단계

### 1. Vercel 로그인
[https://vercel.com](https://vercel.com) 접속 후 로그인

### 2. 새 프로젝트 추가
- Dashboard에서 **"Add New..."** → **"Project"** 클릭
- 또는 직접 링크: https://vercel.com/new

### 3. GitHub 저장소 Import
- **"Import Git Repository"** 섹션에서
- `utonics/mysolar-dahboard` 검색 또는 선택
- **"Import"** 버튼 클릭

### 4. 프로젝트 설정
- **Project Name**: 자동 설정 또는 원하는 이름 입력
- **Framework Preset**: Next.js (자동 감지)
- **Root Directory**: `.` (그대로 유지)

### 5. 환경변수 설정 ⚠️ 중요!

**Environment Variables** 섹션에서 다음 변수 추가:

#### 보안 강화 변수 (권장):
```
HIVEMQ_HOST = ----
HIVEMQ_PORT = 8884
HIVEMQ_USERNAME = ----
HIVEMQ_PASSWORD = ----
```

#### 레거시 호환 변수 (임시):
```
NEXT_PUBLIC_HIVEMQ_HOST = ----
NEXT_PUBLIC_HIVEMQ_PORT = 8884
NEXT_PUBLIC_HIVEMQ_USERNAME = ----
NEXT_PUBLIC_HIVEMQ_PASSWORD = ----
```

### 6. 배포 시작
- **"Deploy"** 버튼 클릭
- 배포 진행 상황 모니터링 (약 1-3분 소요)

### 7. 배포 완료 확인
- 배포 완료 후 제공되는 URL로 접속
- 예시: `https://mysolar-dashboard.vercel.app`
- 대시보드가 정상 작동하는지 확인

## 🔄 자동 배포 설정

이제부터 GitHub에 코드를 푸시하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "Update features"
git push
```

## 🛠️ 문제 해결

### MQTT 연결 실패
1. Vercel Dashboard → Settings → Environment Variables
2. 모든 환경변수가 올바르게 설정되었는지 확인
3. 재배포: Deployments → Redeploy

### 빌드 오류
1. Vercel Dashboard → Functions 탭에서 로그 확인
2. 로컬에서 `npm run build` 테스트

### 환경변수 미적용
1. 환경변수 수정 후 반드시 **Redeploy** 필요
2. Production, Preview, Development 환경 구분 확인

## 📊 배포 후 체크리스트

- [ ] 사이트 접속 가능 여부
- [ ] MQTT 연결 상태 (헤더의 연결 표시)
- [ ] 실시간 데이터 수신 확인
- [ ] 차트 및 UI 컴포넌트 정상 작동
- [ ] 모바일 반응형 확인

## 🎯 추가 설정 (선택사항)

### 커스텀 도메인 연결
1. Settings → Domains
2. Add Domain → 도메인 입력
3. DNS 설정 안내 따라하기

### 분석 도구 활성화
1. Analytics 탭
2. Enable Analytics

### 속도 최적화
1. Speed Insights 활성화
2. Web Vitals 모니터링

## 💡 팁

- **환경변수 보안**: Production 환경에서만 실제 값 사용
- **브랜치별 배포**: main 브랜치는 production, 다른 브랜치는 preview
- **롤백**: Deployments에서 이전 버전으로 즉시 롤백 가능

---

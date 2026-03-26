# Vercel 환경변수 설정 가이드

## 📋 필수 환경변수 (복사해서 사용)

Vercel Dashboard → Settings → Environment Variables에서 아래 변수들을 추가하세요.

### 각 변수별로 추가하기:

1. **HIVEMQ_HOST**
   ```
   Value: ---
   Environment: ✅ Production, ✅ Preview, ✅ Development
   ```

2. **HIVEMQ_PORT**
   ```
   Value: 8884
   Environment: ✅ Production, ✅ Preview, ✅ Development
   ```

3. **HIVEMQ_USERNAME**
   ```
   Value: --
   Environment: ✅ Production, ✅ Preview, ✅ Development
   ```

4. **HIVEMQ_PASSWORD**
   ```
   Value: ----
   Environment: ✅ Production, ✅ Preview, ✅ Development
   ```

5. **NEXT_PUBLIC_HIVEMQ_HOST**
   ```
   Value: ----
   Environment: ✅ Production, ✅ Preview, ✅ Development
   ```

6. **NEXT_PUBLIC_HIVEMQ_PORT**
   ```
   Value: 8884
   Environment: ✅ Production, ✅ Preview, ✅ Development
   ```

7. **NEXT_PUBLIC_HIVEMQ_USERNAME**
   ```
   Value: ----
   Environment: ✅ Production, ✅ Preview, ✅ Development
   ```

8. **NEXT_PUBLIC_HIVEMQ_PASSWORD**
   ```
   Value: ---
   Environment: ✅ Production, ✅ Preview, ✅ Development
   ```

## ⚠️ 중요 체크사항:

1. **각 변수를 개별적으로 추가** (한 번에 여러 개 추가 X)
2. **Value 앞뒤 공백 제거**
3. **모든 Environment 체크** (Production, Preview, Development)
4. **Save 버튼 클릭**

## 🔄 환경변수 추가 후:

1. **Deployments** 탭으로 이동
2. 최근 배포의 `...` 메뉴 클릭
3. **Redeploy** 선택
4. **"Use existing Build Cache"** 체크 해제
5. **Redeploy** 클릭

## 🧪 테스트:

배포 완료 후:
1. Production URL로 접속
2. 헤더에서 "Connected" 상태 확인
3. 또는 `/api/test` 엔드포인트 접속하여 환경변수 확인

## 🐛 문제 해결:

### 여전히 "Disconnected"인 경우:
1. 브라우저 개발자 도구 (F12) → Console 확인
2. Vercel Functions 로그 확인 (Dashboard → Functions 탭)
3. 환경변수 값이 정확한지 다시 확인

### HiveMQ 연결 확인:
1. HiveMQ Cloud Dashboard 로그인
2. Cluster → Clients 탭에서 연결 시도 확인
3. Access Management → Credentials 확인
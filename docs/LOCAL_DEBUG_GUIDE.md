# 로컬 환경 MQTT 연결 디버깅 가이드

## 🔍 문제 진단 방법

### 1. 환경 변수 확인

개발 서버를 시작하면 브라우저 콘솔에 다음과 같은 디버깅 정보가 표시됩니다:

```
=== ENVIRONMENT VARIABLES DEBUG ===
Environment: { NODE_ENV: 'development', isClient: true, isBrowser: true }
MQTT Config from process.env: {
  NEXT_PUBLIC_HIVEMQ_HOST: '----',
  NEXT_PUBLIC_HIVEMQ_PORT: '8884',
  NEXT_PUBLIC_HIVEMQ_USERNAME: '----',
  NEXT_PUBLIC_HIVEMQ_PASSWORD: '[SET]'
}
===================================
```

**확인 사항**:
- ✅ 모든 변수가 올바르게 표시되는가?
- ❌ `undefined` 또는 `MISSING`이 있는가?

### 2. 연결 상태 확인

#### 성공 케이스:
```
✅ Connecting to MQTT broker: { url: 'wss://...', username: 'hivemq.webclient...', port: 8884 }
✅ Connected to MQTT broker
✅ Subscribed to topics: solar/inverter/status, solar/environment/data
```

#### 실패 케이스:
```
===== MQTT ERROR START =====
Error Code 5: Not authorized ❌
Connection attempt details: { ... }
===== MQTT ERROR END =====
```

## 🛠️ 해결 방법

### 방법 1: 개발 서버 완전 재시작

환경 변수를 변경한 경우 **반드시** 서버를 재시작해야 합니다:

```bash
# 현재 서버 중지 (Ctrl+C)
npm run dev
```

### 방법 2: 캐시 클리어 후 재시작

환경 변수가 제대로 로드되지 않는 경우:

```bash
# 빌드 캐시 삭제
npm run clean

# 또는 모든 캐시 삭제 및 재설치
npm run clean:all

# 개발 서버 재시작
npm run dev
```

### 방법 3: 클린 재시작 (한 번에)

```bash
npm run dev:clean
```

### 방법 4: 환경 변수 파일 확인

`.env.local` 파일이 다음 모든 변수를 포함하는지 확인:

```env
# 클라이언트 사이드 (NEXT_PUBLIC_)
NEXT_PUBLIC_HIVEMQ_HOST=----
NEXT_PUBLIC_HIVEMQ_PORT=8884
NEXT_PUBLIC_HIVEMQ_USERNAME=----
NEXT_PUBLIC_HIVEMQ_PASSWORD=----

# 서버 사이드 (일반)
HIVEMQ_HOST=----
HIVEMQ_PORT=8884
HIVEMQ_USERNAME=----
HIVEMQ_PASSWORD=----
```

## 🔒 HMR (Hot Module Replacement) 관련

개발 환경에서 코드 변경 시 중복 연결을 방지하기 위해 다음과 같은 메시지가 표시될 수 있습니다:

```
♻️ HMR: Reusing existing MQTT connection
⚠️ Connection already in progress or established, skipping...
```

**이것은 정상입니다.** 기존 연결을 재사용하여 리소스를 절약합니다.

## 📊 추가 디버깅 정보

### MQTT 에러 코드

- **Code 1**: Unacceptable protocol version
- **Code 2**: Client identifier rejected
- **Code 3**: Server unavailable
- **Code 4**: Bad username or password ❌
- **Code 5**: Not authorized ❌

### Vercel과 로컬의 차이점

| 항목 | Vercel | 로컬 |
|------|--------|------|
| 환경 변수 로딩 | 대시보드에서 직접 설정 | .env / .env.local 파일 |
| 빌드 | Production 최적화 | Development + HMR |
| 캐싱 | 최적화된 캐싱 | 개발 캐시 |
| 실행 환경 | Linux | Windows MSYS |

## ✅ 정상 작동 확인

다음 조건들이 모두 만족되면 정상 작동 중입니다:

1. ✅ 환경 변수 디버그 출력에 모든 값이 표시됨
2. ✅ "Connected to MQTT broker" 메시지 표시
3. ✅ "Subscribed to topics" 메시지 표시
4. ✅ 30초마다 데이터 수신 (콘솔에 "Received message" 표시)
5. ✅ 대시보드에 실시간 데이터 표시

## 🆘 여전히 문제가 있다면?

1. 브라우저 콘솔 전체 로그 확인
2. `=== MQTT ERROR START ===` ~ `=== MQTT ERROR END ===` 섹션 확인
3. Error Code 확인
4. Connection attempt details 확인

모든 디버깅 정보가 자세하게 표시되므로 정확한 문제 파악이 가능합니다.

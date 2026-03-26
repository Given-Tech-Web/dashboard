# MySolar Dashboard 구성요소 가이드

## 📊 대시보드 개요
MySolar Dashboard는 태양광 발전 시스템을 실시간으로 모니터링하는 웹 애플리케이션입니다. MQTT 프로토콜을 통해 인버터와 환경 센서로부터 데이터를 수신하여 시각적으로 표시합니다.

## 🔧 시스템 사양
| 구성요소 | 사양 | 상세 |
|----------|------|------|
| **Solar PV** | 3kW | 500Wp × 6 modules |
| **Battery** | 19kWh | 12VDC × 200Ah × 8 sets (48V 시스템) |
| **Generator** | 6.5kW | 5.5kVA ~ 6.5kVA |
| **Inverter** | 5kW | 정격 5kW, 피크 6kW |

---

## 🔌 1. Generator (발전기) 패널

### 표시 정보
| 항목 | 설명 | 데이터 출처 | 단위 |
|------|------|------------|------|
| **상태 표시** | RUNNING/STOPPED | `data.generator.status` | - |
| **AC Voltage** | 발전기 출력 전압 | `data.generator.voltage` | V (볼트) |
| **Frequency** | 발전기 출력 주파수 | `data.generator.frequency` | Hz (헤르츠) |
| **Output Power** | 인버터 출력 전력 | `data.inverter.output_power` | W (와트) |
| **Load** | 부하율 (전력 사용 비율) | `data.inverter.load_percentage` | % |

### 용어 설명
- **발전기 (Generator)**: 6.5kW 용량의 비상 백업 전원
- **AC Voltage**: 교류 전압으로, 가정용 전기의 전압 수준 (220V)
- **Frequency**: 전기의 진동 주파수 (한국 표준: 60Hz)
- **Load**: 현재 사용 중인 전력의 비율 (최대 6.5kW 기준)
  - 🟢 녹색 (0-60%): 정상
  - 🟡 노란색 (60-80%): 주의
  - 🔴 빨간색 (80-100%): 과부하

---

## 🔋 2. Battery Status (배터리 상태) 패널

### 표시 정보
| 항목 | 설명 | 데이터 출처 | 단위 |
|------|------|------------|------|
| **충전율** | 배터리 잔량 비율 | `data.battery.capacity_percent` | % |
| **Available Energy** | 저장된 에너지양 | `19kWh × 충전율%` | kWh |
| **System Voltage** | 시스템 전압 | `data.battery.voltage` | 48V |
| **Charging** | 충전 전류 | `data.battery.charging_current` | A (암페어) |
| **Discharging** | 방전 전류 | `data.battery.discharge_current` | A |
| **Status** | 현재 상태 | 충전/방전 전류 기반 계산 | - |

### 용어 설명
- **충전율 색상 표시**:
  - 🟢 녹색 (60-100%): 충분 (11.4kWh ~ 19kWh)
  - 🟡 노란색 (30-60%): 보통 (5.7kWh ~ 11.4kWh)
  - 🔴 빨간색 (0-30%): 부족 (0 ~ 5.7kWh)
- **19kWh 총 용량**: 12V × 200Ah × 8개 배터리 = 19,200Wh
- **48V 시스템**: 12V 배터리 4개 직렬 × 2병렬
- **사용 가능 용량**: 약 15.2kWh (DoD 80% 적용)

### 상태 판단 로직
```javascript
if (charging_current > 0) → "Charging" (충전 중)
else if (discharge_current > 0) → "Discharging" (방전 중)
else → "Idle" (대기)
```

---

## ☀️ 3. Solar Generation (태양광 발전) 패널

### 표시 정보
| 항목 | 설명 | 데이터 출처 | 단위 |
|------|------|------------|------|
| **Current Power** | 현재 발전량 | `data.solar.power_w` | W |
| **Peak Power** | 세션 최고 발전량 | 세션 중 최댓값 저장 | W |
| **Solar Voltage** | 태양광 패널 전압 | `data.solar.voltage` | V |
| **Efficiency** | 발전 효율 | `(power_w / 3000) × 100` | % |
| **Power Trend** | 발전량 추이 | 최근 20개 데이터 | 그래프 |
| **Status** | 발전 상태 | `power_w > 0` 확인 | - |

### 용어 설명
- **3kW 시스템**: 500Wp × 6개 모듈
- **발전 효율**: 시스템 용량(3kW) 대비 현재 발전량 비율
- **Peak Power**: 앱 실행 후 기록된 최고 발전량
- **Power Trend**: 실시간 발전량 변화를 보여주는 미니 차트

### 계산식
- **효율** = (현재 발전량 ÷ 3000W) × 100%
- **최대 발전량**: 3000W (이상적 조건)

---

## ⚡ 4. Inverter Status (인버터 상태) 패널

### 표시 정보
| 항목 | 설명 | 데이터 출처 | 단위 |
|------|------|------------|------|
| **Status** | 작동 상태 | `output_power > 0` 확인 | ACTIVE/STANDBY |
| **Output Power** | 출력 전력 | `data.inverter.output_power` | W |
| **Apparent Power** | 피상 전력 | `output_power`와 동일 | VA |
| **Load** | 부하율 | `data.inverter.load_percentage` | % |
| **Voltage** | 출력 전압 | `data.inverter.output_voltage` | V |
| **Frequency** | 출력 주파수 | `data.inverter.output_frequency` | Hz |
| **Power Factor** | 역률 | 현재 1.0 (고정값) | - |

### 용어 설명
- **인버터**: DC(직류)를 AC(교류)로 변환하는 장치 (5kW 정격, 6kW 피크)
- **Output Power**: 실제로 사용되는 유효 전력 (최대 5kW)
- **Apparent Power**: 전체 공급 전력 (유효전력 + 무효전력)
- **Power Factor (역률)**: 전력 효율성 지표 (1.0이 이상적)
- **부하율 색상**:
  - 🟢 녹색 (0-40%): 낮음
  - 🟡 노란색 (40-60%): 보통
  - 🟠 주황색 (60-80%): 높음
  - 🔴 빨간색 (80-100%): 매우 높음

### 상태 표시등
- **Grid**: 전력망 연결 (전압 > 200V)
- **Inverter**: 인버터 작동 중
- **Load**: 부하 연결됨 (부하 > 0%)

---

## 🌡️ 5. Environment (환경) 패널

### 표시 정보
| 항목 | 설명 | 데이터 출처 | 단위 |
|------|------|------------|------|
| **Temperature** | 현재 온도 | `data.environment.temperature` | °C |
| **Humidity** | 현재 습도 | `data.environment.humidity` | % |

### 용어 설명
- **온도**: 태양광 패널 효율에 영향 (25°C가 최적)
- **습도**: 전자 장비 보호를 위한 모니터링

---

## 🌱 6. Carbon Savings (탄소 절감) 패널

### 표시 정보
| 항목 | 설명 | 계산 방법 | 단위 |
|------|------|-----------|------|
| **Today** | 오늘 CO₂ 절감량 | `power_kwh × 0.5` | kg |
| **This Month** | 이번 달 절감량 | 하드코딩 값 | kg |
| **Total** | 총 절감량 | 하드코딩 값 | kg |
| **Trees Equivalent** | 나무 환산 | `total ÷ 21.77` | 그루 |

### 계산식
- **CO₂ 절감량** = 발전량(kWh) × 0.5 kg CO₂/kWh
- **나무 환산** = 총 CO₂ 절감량 ÷ 21.77 kg/년/나무

---

## ⚡ 7. Energy Summary (에너지 요약) 패널

### 표시 정보
| 항목 | 설명 | 계산 방법 | 단위 |
|------|------|-----------|------|
| **Current Output** | 현재 발전량 | `data.solar.power_w` | kW |
| **Solar Efficiency** | 태양광 효율 | `(power_w ÷ 3000) × 100` | % |
| **Self-Sufficiency** | 자급률 | `(solar_power ÷ load) × 100` | % |
| **Today's Energy** | 오늘 발전량 | `data.solar.power_kwh` | kWh |
| **Current Load** | 현재 부하 | `data.inverter.output_power` | kW |
| **Battery Status** | 배터리 상태 | 충/방전 전류 기반 | - |
| **Generator Status** | 발전기 상태 | `data.generator.status` | - |

### 에너지 상태 표시
- **High Production**: 발전량 > 500W
- **Moderate Production**: 100W < 발전량 ≤ 500W
- **Battery Charging**: 배터리 충전 중
- **Grid Supply**: 발전기 작동 중
- **Low Production**: 발전량 ≤ 100W

---

## 🚨 8. System Alerts (시스템 알림) 패널

### 표시 정보
- 현재는 실제 알림 없음 (백엔드 미구현)
- 향후 시스템 이상, 경고, 정보 메시지 표시 예정

### 알림 유형
- 🔴 **Error**: 시스템 오류
- 🟡 **Warning**: 주의 사항
- 🟢 **Success**: 정상 작동
- 🔵 **Info**: 일반 정보

---

## 📡 데이터 흐름

### MQTT 토픽 구조
1. **인버터 데이터**: `solar/inverter/status`
   - 실시간 발전, 배터리, 인버터 정보
   - 약 5초마다 업데이트

2. **환경 데이터**: `solar/environment/data`
   - 온도, 습도 정보
   - 약 10초마다 업데이트

### 데이터 변환 과정
```
MQTT 원시 데이터 → transformToRealtimeData() → RealtimeData 인터페이스 → 각 컴포넌트
```

---

## 🔧 주요 기능

### 1. 실시간 업데이트
- WebSocket 기반 MQTT 연결
- 자동 재연결 기능
- 30초 연결 타임아웃

### 2. 애니메이션
- 숫자 변경 시 부드러운 전환
- 로딩 상태 표시
- 차트 실시간 업데이트

### 3. 반응형 디자인
- 모바일, 태블릿, 데스크톱 지원
- 터치 친화적 인터페이스

---

## 📌 참고사항

### 현재 제한사항
1. **Historical Data**: 데이터베이스 미구현으로 과거 데이터 없음
2. **Real-time Only**: 세션 동안만 데이터 유지

### 향후 개선사항
- 데이터베이스 연동으로 히스토리 데이터 저장
- 실제 가동시간 계산 로직 구현
- 사용자별 설정 (패널 용량, 지역 등)
- 알림 시스템 구현

---

## 💡 사용 팁

1. **색상의 의미**를 이해하면 시스템 상태를 빠르게 파악 가능
2. **Load %**가 80% 이상이면 전력 사용량 조절 필요
3. **Battery %**가 30% 이하면 충전 필요
4. **Solar Efficiency**가 낮으면 패널 점검 필요

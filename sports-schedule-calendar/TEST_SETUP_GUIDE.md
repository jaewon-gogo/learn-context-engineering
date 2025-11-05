# 테스트 환경 설정 가이드

## 설치 및 실행

### 1. Backend 테스트 환경 설정

```bash
cd sports-schedule-calendar/backend
npm install
```

**필요한 환경 변수 설정** (`.env` 파일):
```env
JWT_SECRET=test-secret-key-for-jwt-testing-min-32-chars
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
GOOGLE_CLIENT_ID=test-client-id
```

**테스트 실행**:
```bash
npm test                    # 모든 테스트 실행
npm run test:unit          # 단위 테스트만
npm run test:coverage      # 커버리지 포함
```

### 2. Frontend 테스트 환경 설정

```bash
cd sports-schedule-calendar/frontend
npm install
```

**테스트 실행**:
```bash
npm test                    # 모든 테스트 실행
npm run test:ui            # UI 모드
npm run test:coverage      # 커버리지 포함
```

## 작성된 테스트 파일

### Backend (5개 파일, 약 51개 테스트)
- ✅ `utils/__tests__/encryption.test.ts`
- ✅ `utils/__tests__/jwt.test.ts`
- ✅ `utils/__tests__/validator.test.ts`
- ✅ `services/__tests__/ScheduleService.test.ts`
- ✅ `services/__tests__/AuthService.test.ts`

### Frontend (3개 파일, 약 13개 테스트)
- ✅ `components/__tests__/Button.test.tsx`
- ✅ `components/__tests__/SportSelector.test.tsx`
- ✅ `hooks/__tests__/useAuth.test.ts`

## 테스트 실행 확인

의존성을 설치한 후 테스트를 실행하여 모든 테스트가 통과하는지 확인하세요.


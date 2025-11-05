# 테스트 시스템 분석 결과

## 분석 일시
2025-11-05

## Backend 기능 분석

### API 엔드포인트 (10개)
1. **인증 시스템**
   - GET /api/v1/auth/google
   - GET /api/v1/auth/google/callback
   - POST /api/v1/auth/logout
   - GET /api/v1/auth/me

2. **팀 관리**
   - GET /api/v1/teams/sports
   - GET /api/v1/teams

3. **경기일정**
   - GET /api/v1/schedules
   - POST /api/v1/schedules/crawl

4. **캘린더 동기화**
   - GET /api/v1/calendar/list
   - POST /api/v1/calendar/sync
   - GET /api/v1/calendar/status
   - PUT /api/v1/calendar/settings

### 비즈니스 로직 함수 (약 40개)
1. **인증 서비스** (AuthService)
   - generateGoogleAuthUrl
   - handleGoogleCallback
   - encryptTokens / decryptTokens
   - createJWTToken / verifyJWTToken
   - isTokenExpired
   - refreshAccessToken

2. **경기일정 서비스** (ScheduleService)
   - validateAndNormalizeSchedule
   - isDuplicateSchedule
   - groupSchedulesByDate
   - filterSchedulesByDateRange
   - filterSchedulesByTeam
   - sortSchedulesByDateTime
   - transformCrawledData

3. **크롤링 서비스** (CrawlerService)
   - parseScheduleFromHTML
   - extractDateFromHTML
   - extractTimeFromHTML
   - transformCrawledSchedules
   - createCrawlHistory
   - validateCrawlUrl
   - parseCrawlConfig

4. **캘린더 동기화 서비스** (CalendarSyncService)
   - convertScheduleToCalendarEvent
   - generateEventId
   - checkRateLimit
   - calculateBackoffDelay
   - createSyncResult
   - createSyncBatches
   - validateCalendarId
   - calculateSyncStatistics
   - filterAccessibleCalendars

5. **유틸리티 함수**
   - 암호화/복호화 (encryption.ts)
   - JWT 토큰 관리 (jwt.ts)
   - 입력값 검증 (validator.ts)
   - 날짜/시간 포맷팅 (dateFormatter.ts)

### 데이터베이스 모델 (8개 테이블)
- sports
- teams
- schedules
- crawl_history
- users
- user_teams
- calendar_settings
- calendar_sync_history

## Frontend 기능 분석

### 컴포넌트 (4개)
1. **Button** - 기본 버튼 컴포넌트
2. **GoogleLoginButton** - Google 로그인 버튼
3. **SportSelector** - 스포츠 선택 컴포넌트
4. **TeamSelector** - 팀 선택 컴포넌트

### 커스텀 훅 (3개)
1. **useAuth** - 인증 상태 관리
2. **useSchedule** - 경기일정 조회
3. **useCalendar** - 캘린더 동기화

### 페이지 (3개)
1. **HomePage** (/) - 로그인 페이지
2. **DashboardPage** (/dashboard) - 대시보드
3. **AuthCallbackPage** (/auth/callback) - OAuth 콜백

## 테스트 계획

### Level 1 테스트 (유닛/모킹)
**Backend Level 1**
- 테스트 대상: 40개 함수
- 예상 테스트 수: 약 120개
- 기술 스택: Jest + TypeScript
- Mock 대상: DB, 외부 API

**Frontend Level 1**
- 테스트 대상: 4개 컴포넌트, 3개 훅
- 예상 테스트 수: 약 30개
- 기술 스택: Vitest + React Testing Library
- Mock 대상: API 호출

### Level 2 테스트 (통합)
**Backend Level 2**
- 테스트 대상: API + DB 연동
- 예상 테스트 수: 약 20개
- 기술 스택: Jest + Test DB

**Frontend Level 2**
- 테스트 대상: 컴포넌트 간 연동, API 통합
- 예상 테스트 수: 약 15개
- 기술 스택: Vitest + MSW

### Level 3 테스트 (E2E)
**Backend Level 3**
- 테스트 대상: 전체 플로우
- 예상 테스트 수: 약 10개
- 기술 스택: Jest + 실제 서비스

**Frontend Level 3**
- 테스트 대상: 사용자 여정
- 예상 테스트 수: 약 8개
- 기술 스택: Playwright

## 권장 실행 순서
1. **Level 1부터 시작** → 기초 품질 확보
2. **Level 2로 통합 확인** → 서비스 간 연동 검증
3. **Level 3로 최종 확인** → 프로덕션 릴리스 전


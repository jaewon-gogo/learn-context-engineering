# 스포츠팀 경기일정 캘린더 웹사이트 API 명세서

## 1. API 개요

### API의 목적과 기능

이 API는 스포츠팀 경기일정 캘린더 웹사이트의 백엔드 서비스를 제공합니다. 주요 기능은 다음과 같습니다:

- Google OAuth 2.0을 통한 사용자 인증
- 스포츠 종목 및 팀 정보 조회
- 경기일정 데이터 조회 및 크롤링
- Google Calendar API를 통한 경기일정 동기화
- 캘린더 연동 설정 및 알림 관리

### 대상 사용자

- 프론트엔드 개발자
- 모바일 앱 개발자 (향후 확장 시)
- 외부 시스템 연동 개발자 (향후 확장 시)

### 사용 기술 스택

- **프로토콜**: RESTful API
- **데이터 형식**: JSON
- **인증 방식**: Google OAuth 2.0 (Bearer Token)
- **API 버전**: v1

### 버전 정보

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0.0 | 2025-11-05 | 초기 API 명세서 작성 |

## 2. 엔드포인트 목록

### 전체 API 목록

| 메서드 | 경로 | 설명 | 인증 필요 |
|--------|------|------|----------|
| GET | `/api/v1/auth/google` | Google OAuth 로그인 시작 | ❌ |
| GET | `/api/v1/auth/google/callback` | Google OAuth 콜백 처리 | ❌ |
| POST | `/api/v1/auth/logout` | 로그아웃 | ✅ |
| GET | `/api/v1/auth/me` | 현재 사용자 정보 조회 | ✅ |
| GET | `/api/v1/sports` | 스포츠 종목 목록 조회 | ✅ |
| GET | `/api/v1/teams` | 팀 목록 조회 | ✅ |
| GET | `/api/v1/schedules` | 경기일정 조회 | ✅ |
| POST | `/api/v1/schedules/crawl` | 경기일정 크롤링 실행 | ✅ |
| GET | `/api/v1/calendar/list` | Google 캘린더 목록 조회 | ✅ |
| POST | `/api/v1/calendar/sync` | 경기일정 캘린더 동기화 | ✅ |
| GET | `/api/v1/calendar/status` | 캘린더 연동 상태 조회 | ✅ |
| PUT | `/api/v1/calendar/settings` | 캘린더 연동 설정 수정 | ✅ |
| POST | `/api/v1/calendar/share` | 캘린더 공유 설정 | ✅ |
| PUT | `/api/v1/calendar/notifications` | 알림 설정 수정 | ✅ |

### 기능별 분류

#### 인증 API
- `/api/v1/auth/*` - Google OAuth 인증 관련 엔드포인트

#### 데이터 조회 API
- `/api/v1/sports` - 스포츠 종목 조회
- `/api/v1/teams` - 팀 정보 조회
- `/api/v1/schedules` - 경기일정 조회

#### 크롤링 API
- `/api/v1/schedules/crawl` - 경기일정 크롤링 실행

#### 캘린더 연동 API
- `/api/v1/calendar/*` - Google Calendar 연동 관련 엔드포인트

## 3. 인증 및 권한

### 인증 방식

**Google OAuth 2.0**을 사용합니다.

#### 인증 플로우

1. 사용자가 프론트엔드에서 "Google로 로그인" 버튼 클릭
2. 프론트엔드에서 `GET /api/v1/auth/google` 호출
3. 백엔드가 Google OAuth 인증 URL로 리디렉션
4. 사용자가 Google 계정으로 로그인 및 권한 승인
5. Google이 `GET /api/v1/auth/google/callback?code={authorization_code}` 호출
6. 백엔드가 authorization code를 access token으로 교환
7. 백엔드가 사용자 정보 조회 및 DB 저장
8. 백엔드가 세션 토큰 또는 JWT 발급
9. 이후 모든 API 요청에 `Authorization: Bearer {token}` 헤더 포함

#### 인증 토큰 사용

모든 인증이 필요한 API 요청에는 다음 헤더를 포함해야 합니다:

```
Authorization: Bearer {access_token}
```

### 권한 수준

현재는 단일 사용자 권한만 지원합니다. 향후 다중 사용자 지원 시 다음 권한 수준을 고려할 수 있습니다:

- **사용자 (User)**: 자신의 데이터만 조회/수정 가능
- **관리자 (Admin)**: 모든 데이터 조회/수정 가능 (향후 확장)

### 인증 실패 시 에러 처리

인증 실패 시 다음 에러 응답을 반환합니다:

```json
{
  "error": "UNAUTHORIZED",
  "message": "인증이 필요합니다",
  "details": {
    "code": "AUTH_REQUIRED"
  }
}
```

HTTP 상태 코드: `401 Unauthorized`

## 4. 엔드포인트 상세

### 인증 API

#### 엔드포인트: GET /api/v1/auth/google

##### 개요
Google OAuth 로그인을 시작합니다. 이 엔드포인트는 Google OAuth 인증 페이지로 리디렉션합니다.

##### 쿼리 파라미터
| 파라미터명 | 타입 | 필수여부 | 기본값 | 설명 |
|------------|------|--------|---------|------------|
| redirect_uri | string | No | - | 콜백 URL (없으면 기본값 사용) |

##### 응답
##### 성공 응답: 302 Found (리디렉션)
Google OAuth 인증 페이지로 리디렉션됩니다.

##### 에러 응답: 500 Internal Server Error
```json
{
  "error": "OAUTH_ERROR",
  "message": "OAuth 설정 오류가 발생했습니다",
  "details": {}
}
```

##### 주의사항
- 이 엔드포인트는 브라우저에서 직접 호출해야 합니다
- 리디렉션 후 Google 로그인 페이지가 표시됩니다

##### 사용 예시
```bash
curl -X GET "https://api.example.com/api/v1/auth/google"
```

---

#### 엔드포인트: GET /api/v1/auth/google/callback

##### 개요
Google OAuth 콜백을 처리하고 사용자 정보를 저장합니다. 이 엔드포인트는 Google에서 호출합니다.

##### 쿼리 파라미터
| 파라미터명 | 타입 | 필수여부 | 기본값 | 설명 |
|------------|------|--------|---------|------------|
| code | string | Yes | - | Google OAuth 인증 코드 |
| state | string | No | - | CSRF 방지를 위한 상태 값 |

##### 응답
##### 성공 응답: 200 OK
```json
{
  "success": true,
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "profile_image_url": "https://lh3.googleusercontent.com/..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| 속성 | 타입 | 설명 |
|------------|------|------------|
| success | boolean | 성공 여부 |
| user | object | 사용자 정보 |
| user.user_id | integer | 사용자 ID |
| user.email | string | 이메일 주소 |
| user.name | string | 이름 |
| user.profile_image_url | string | 프로필 이미지 URL |
| token | string | JWT 토큰 (또는 세션 토큰) |

##### 에러 응답: 400 Bad Request
```json
{
  "error": "INVALID_CODE",
  "message": "유효하지 않은 인증 코드입니다",
  "details": {}
}
```

##### 주의사항
- 이 엔드포인트는 Google OAuth 서버에서만 호출됩니다
- 인증 코드는 일회용이며 10분 내에 사용해야 합니다

---

#### 엔드포인트: POST /api/v1/auth/logout

##### 개요
현재 사용자를 로그아웃 처리합니다.

##### 요청 헤더
| 헤더명 | 필수여부 | 설명 |
|-----------|--------|------------|
| Authorization | Yes | Bearer 토큰 |

##### 응답
##### 성공 응답: 200 OK
```json
{
  "success": true,
  "message": "로그아웃되었습니다"
}
```

##### 에러 응답: 401 Unauthorized
```json
{
  "error": "UNAUTHORIZED",
  "message": "인증이 필요합니다",
  "details": {}
}
```

##### 사용 예시
```bash
curl -X POST "https://api.example.com/api/v1/auth/logout" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### 엔드포인트: GET /api/v1/auth/me

##### 개요
현재 로그인한 사용자의 정보를 조회합니다.

##### 요청 헤더
| 헤더명 | 필수여부 | 설명 |
|-----------|--------|------------|
| Authorization | Yes | Bearer 토큰 |

##### 응답
##### 성공 응답: 200 OK
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "name": "홍길동",
  "profile_image_url": "https://lh3.googleusercontent.com/...",
  "created_at": "2024-01-01T00:00:00Z",
  "last_login_at": "2024-12-19T10:30:00Z"
}
```

| 속성 | 타입 | 설명 |
|------------|------|------------|
| user_id | integer | 사용자 ID |
| email | string | 이메일 주소 |
| name | string | 이름 |
| profile_image_url | string | 프로필 이미지 URL |
| created_at | string | 계정 생성 일시 (ISO 8601) |
| last_login_at | string | 최종 로그인 일시 (ISO 8601) |

##### 에러 응답: 401 Unauthorized
```json
{
  "error": "UNAUTHORIZED",
  "message": "인증이 필요합니다",
  "details": {}
}
```

##### 사용 예시
```bash
curl -X GET "https://api.example.com/api/v1/auth/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 데이터 조회 API

#### 엔드포인트: GET /api/v1/sports

##### 개요
지원하는 스포츠 종목 목록을 조회합니다.

##### 요청 헤더
| 헤더명 | 필수여부 | 설명 |
|-----------|--------|------------|
| Authorization | Yes | Bearer 토큰 |

##### 쿼리 파라미터
| 파라미터명 | 타입 | 필수여부 | 기본값 | 설명 |
|------------|------|--------|---------|------------|
| active_only | boolean | No | true | 활성화된 종목만 조회 |

##### 응답
##### 성공 응답: 200 OK
```json
{
  "sports": [
    {
      "sports_id": 1,
      "sports_name": "야구",
      "display_order": 1,
      "is_active": true
    },
    {
      "sports_id": 2,
      "sports_name": "축구",
      "display_order": 2,
      "is_active": true
    }
  ]
}
```

| 속성 | 타입 | 설명 |
|------------|------|------------|
| sports | array | 스포츠 종목 배열 |
| sports[].sports_id | integer | 스포츠 ID |
| sports[].sports_name | string | 스포츠 이름 |
| sports[].display_order | integer | 표시 순서 |
| sports[].is_active | boolean | 활성화 여부 |

##### 사용 예시
```bash
curl -X GET "https://api.example.com/api/v1/sports?active_only=true" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### 엔드포인트: GET /api/v1/teams

##### 개요
팀 목록을 조회합니다. 스포츠 종목별로 필터링할 수 있습니다.

##### 요청 헤더
| 헤더명 | 필수여부 | 설명 |
|-----------|--------|------------|
| Authorization | Yes | Bearer 토큰 |

##### 쿼리 파라미터
| 파라미터명 | 타입 | 필수여부 | 기본값 | 설명 |
|------------|------|--------|---------|------------|
| sports_id | integer | No | - | 스포츠 ID로 필터링 |
| active_only | boolean | No | true | 활성화된 팀만 조회 |

##### 응답
##### 성공 응답: 200 OK
```json
{
  "teams": [
    {
      "team_id": 1,
      "sports_id": 1,
      "team_name": "LG 트윈스",
      "team_official_name": "LG 트윈스",
      "is_active": true
    },
    {
      "team_id": 2,
      "sports_id": 1,
      "team_name": "삼성 라이온즈",
      "team_official_name": "삼성 라이온즈",
      "is_active": true
    }
  ]
}
```

| 속성 | 타입 | 설명 |
|------------|------|------------|
| teams | array | 팀 배열 |
| teams[].team_id | integer | 팀 ID |
| teams[].sports_id | integer | 스포츠 ID |
| teams[].team_name | string | 팀 이름 |
| teams[].team_official_name | string | 팀 공식 이름 |
| teams[].is_active | boolean | 활성화 여부 |

##### 사용 예시
```bash
curl -X GET "https://api.example.com/api/v1/teams?sports_id=1&active_only=true" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### 엔드포인트: GET /api/v1/schedules

##### 개요
경기일정을 조회합니다. 팀, 날짜 범위로 필터링할 수 있습니다.

##### 요청 헤더
| 헤더명 | 필수여부 | 설명 |
|-----------|--------|------------|
| Authorization | Yes | Bearer 토큰 |

##### 쿼리 파라미터
| 파라미터명 | 타입 | 필수여부 | 기본값 | 설명 |
|------------|------|--------|---------|------------|
| team_id | integer | No | - | 팀 ID로 필터링 |
| sport_id | integer | No | - | 스포츠 ID로 필터링 |
| start_date | string | No | 오늘 | 시작 날짜 (YYYY-MM-DD) |
| end_date | string | No | 30일 후 | 종료 날짜 (YYYY-MM-DD) |
| limit | integer | No | 100 | 최대 반환 개수 |
| offset | integer | No | 0 | 페이지 오프셋 |

##### 응답
##### 성공 응답: 200 OK
```json
{
  "schedules": [
    {
      "schedule_id": 1,
      "team_id": 1,
      "team_name": "LG 트윈스",
      "game_date": "2024-03-15",
      "game_time": "18:30",
      "opponent_team": "KT 위즈",
      "venue_type": "HOME",
      "venue_name": "잠실야구장",
      "game_status": "SCHEDULED",
      "game_result": null,
      "score": null
    }
  ],
  "total": 50,
  "limit": 100,
  "offset": 0
}
```

| 속성 | 타입 | 설명 |
|------------|------|------------|
| schedules | array | 경기일정 배열 |
| schedules[].schedule_id | integer | 경기 ID |
| schedules[].team_id | integer | 팀 ID |
| schedules[].team_name | string | 팀 이름 |
| schedules[].game_date | string | 경기 날짜 (YYYY-MM-DD) |
| schedules[].game_time | string | 경기 시간 (HH:MM) |
| schedules[].opponent_team | string | 상대팀 이름 |
| schedules[].venue_type | string | 장소 구분 (HOME/AWAY) |
| schedules[].venue_name | string | 경기장 이름 |
| schedules[].game_status | string | 경기 상태 (SCHEDULED/IN_PROGRESS/FINISHED/CANCELLED) |
| schedules[].game_result | string | 경기 결과 (선택) |
| schedules[].score | string | 점수 (선택) |
| total | integer | 전체 개수 |
| limit | integer | 페이지당 개수 |
| offset | integer | 오프셋 |

##### 사용 예시
```bash
curl -X GET "https://api.example.com/api/v1/schedules?team_id=1&start_date=2024-03-01&end_date=2024-03-31" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 크롤링 API

#### 엔드포인트: POST /api/v1/schedules/crawl

##### 개요
경기일정을 크롤링하여 데이터베이스에 저장합니다. 수동으로 크롤링을 트리거할 수 있습니다.

##### 요청 헤더
| 헤더명 | 필수여부 | 설명 |
|-----------|--------|------------|
| Authorization | Yes | Bearer 토큰 |
| Content-Type | Yes | application/json |

##### 요청 본문 (Request Body)
```json
{
  "team_id": 1,
  "force_update": false
}
```

| 속성 | 타입 | 필수여부 | 설명 |
|------------|------|--------|------------|
| team_id | integer | Yes | 크롤링할 팀 ID |
| force_update | boolean | No | false | 기존 데이터 강제 업데이트 여부 |

##### 응답
##### 성공 응답: 200 OK
```json
{
  "success": true,
  "message": "크롤링이 완료되었습니다",
  "crawl_result": {
    "crawl_id": 123,
    "team_id": 1,
    "games_collected": 50,
    "crawl_status": "SUCCESS",
    "started_at": "2024-12-19T10:00:00Z",
    "finished_at": "2024-12-19T10:05:00Z"
  }
}
```

| 속성 | 타입 | 설명 |
|------------|------|------------|
| success | boolean | 성공 여부 |
| message | string | 응답 메시지 |
| crawl_result | object | 크롤링 결과 |
| crawl_result.crawl_id | integer | 크롤링 ID |
| crawl_result.team_id | integer | 팀 ID |
| crawl_result.games_collected | integer | 수집된 경기 수 |
| crawl_result.crawl_status | string | 크롤링 상태 |
| crawl_result.started_at | string | 시작 일시 |
| crawl_result.finished_at | string | 종료 일시 |

##### 에러 응답: 400 Bad Request
```json
{
  "error": "INVALID_TEAM",
  "message": "유효하지 않은 팀 ID입니다",
  "details": {}
}
```

##### 에러 응답: 500 Internal Server Error
```json
{
  "error": "CRAWL_FAILED",
  "message": "크롤링 중 오류가 발생했습니다",
  "details": {
    "error_message": "크롤링 대상 사이트 구조 변경"
  }
}
```

##### 주의사항
- 크롤링은 시간이 걸릴 수 있으므로 비동기로 처리하는 것을 권장합니다
- 동일한 팀에 대한 중복 크롤링 요청은 제한될 수 있습니다

##### 사용 예시
```bash
curl -X POST "https://api.example.com/api/v1/schedules/crawl" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"team_id": 1, "force_update": false}'
```

---

### 캘린더 연동 API

#### 엔드포인트: GET /api/v1/calendar/list

##### 개요
사용자의 Google 캘린더 목록을 조회합니다.

##### 요청 헤더
| 헤더명 | 필수여부 | 설명 |
|-----------|--------|------------|
| Authorization | Yes | Bearer 토큰 |

##### 응답
##### 성공 응답: 200 OK
```json
{
  "calendars": [
    {
      "calendar_id": "primary",
      "calendar_name": "홍길동",
      "description": "기본 캘린더",
      "timezone": "Asia/Seoul",
      "access_role": "owner"
    },
    {
      "calendar_id": "abc123@group.calendar.google.com",
      "calendar_name": "스포츠 경기",
      "description": "경기일정 캘린더",
      "timezone": "Asia/Seoul",
      "access_role": "owner"
    }
  ]
}
```

| 속성 | 타입 | 설명 |
|------------|------|------------|
| calendars | array | 캘린더 배열 |
| calendars[].calendar_id | string | Google 캘린더 ID |
| calendars[].calendar_name | string | 캘린더 이름 |
| calendars[].description | string | 캘린더 설명 |
| calendars[].timezone | string | 시간대 |
| calendars[].access_role | string | 접근 권한 (owner/reader/writer) |

##### 에러 응답: 401 Unauthorized
```json
{
  "error": "OAUTH_TOKEN_EXPIRED",
  "message": "OAuth 토큰이 만료되었습니다. 다시 로그인해주세요",
  "details": {}
}
```

##### 사용 예시
```bash
curl -X GET "https://api.example.com/api/v1/calendar/list" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### 엔드포인트: POST /api/v1/calendar/sync

##### 개요
경기일정을 Google 캘린더에 동기화합니다.

##### 요청 헤더
| 헤더명 | 필수여부 | 설명 |
|-----------|--------|------------|
| Authorization | Yes | Bearer 토큰 |
| Content-Type | Yes | application/json |

##### 요청 본문 (Request Body)
```json
{
  "calendar_id": "primary",
  "team_ids": [1, 2],
  "start_date": "2024-03-01",
  "end_date": "2024-03-31",
  "notification_enabled": true
}
```

| 속성 | 타입 | 필수여부 | 설명 |
|------------|------|--------|------------|
| calendar_id | string | Yes | Google 캘린더 ID |
| team_ids | array | Yes | 동기화할 팀 ID 배열 |
| start_date | string | No | 시작 날짜 (YYYY-MM-DD) |
| end_date | string | No | 종료 날짜 (YYYY-MM-DD) |
| notification_enabled | boolean | No | true | 알림 활성화 여부 |

##### 응답
##### 성공 응답: 200 OK
```json
{
  "success": true,
  "message": "동기화가 완료되었습니다",
  "sync_result": {
    "total_games": 50,
    "synced_games": 48,
    "failed_games": 2,
    "sync_id": 456
  }
}
```

| 속성 | 타입 | 설명 |
|------------|------|------------|
| success | boolean | 성공 여부 |
| message | string | 응답 메시지 |
| sync_result | object | 동기화 결과 |
| sync_result.total_games | integer | 전체 경기 수 |
| sync_result.synced_games | integer | 동기화 성공한 경기 수 |
| sync_result.failed_games | integer | 동기화 실패한 경기 수 |
| sync_result.sync_id | integer | 동기화 ID |

##### 에러 응답: 400 Bad Request
```json
{
  "error": "INVALID_CALENDAR",
  "message": "유효하지 않은 캘린더 ID입니다",
  "details": {}
}
```

##### 에러 응답: 429 Too Many Requests
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Google Calendar API 할당량을 초과했습니다. 잠시 후 다시 시도해주세요",
  "details": {
    "retry_after": 3600
  }
}
```

##### 주의사항
- Google Calendar API Rate Limiting: 초당 100 쿼리 제한
- 일일 할당량: 1,000,000 쿼리
- 할당량 초과 시 429 에러 반환

##### 사용 예시
```bash
curl -X POST "https://api.example.com/api/v1/calendar/sync" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "calendar_id": "primary",
    "team_ids": [1, 2],
    "start_date": "2024-03-01",
    "end_date": "2024-03-31"
  }'
```

---

#### 엔드포인트: GET /api/v1/calendar/status

##### 개요
캘린더 연동 상태를 조회합니다.

##### 요청 헤더
| 헤더명 | 필수여부 | 설명 |
|-----------|--------|------------|
| Authorization | Yes | Bearer 토큰 |

##### 응답
##### 성공 응답: 200 OK
```json
{
  "is_connected": true,
  "calendar_settings": {
    "settings_id": 1,
    "google_calendar_id": "primary",
    "calendar_name": "홍길동",
    "auto_sync": true,
    "sync_interval": "DAILY",
    "email_notification": true,
    "push_notification": true,
    "notification_timing": "1일전,1시간전"
  },
  "last_sync_at": "2024-12-19T10:00:00Z",
  "sync_status": "SUCCESS"
}
```

| 속성 | 타입 | 설명 |
|------------|------|------------|
| is_connected | boolean | 캘린더 연동 여부 |
| calendar_settings | object | 캘린더 설정 정보 |
| calendar_settings.settings_id | integer | 설정 ID |
| calendar_settings.google_calendar_id | string | Google 캘린더 ID |
| calendar_settings.calendar_name | string | 캘린더 이름 |
| calendar_settings.auto_sync | boolean | 자동 동기화 여부 |
| calendar_settings.sync_interval | string | 동기화 주기 (HOURLY/DAILY/WEEKLY) |
| calendar_settings.email_notification | boolean | 이메일 알림 여부 |
| calendar_settings.push_notification | boolean | 푸시 알림 여부 |
| calendar_settings.notification_timing | string | 알림 시점 |
| last_sync_at | string | 마지막 동기화 일시 |
| sync_status | string | 동기화 상태 |

##### 사용 예시
```bash
curl -X GET "https://api.example.com/api/v1/calendar/status" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### 엔드포인트: PUT /api/v1/calendar/settings

##### 개요
캘린더 연동 설정을 수정합니다.

##### 요청 헤더
| 헤더명 | 필수여부 | 설명 |
|-----------|--------|------------|
| Authorization | Yes | Bearer 토큰 |
| Content-Type | Yes | application/json |

##### 요청 본문 (Request Body)
```json
{
  "google_calendar_id": "primary",
  "calendar_name": "스포츠 경기일정",
  "auto_sync": true,
  "sync_interval": "DAILY",
  "email_notification": true,
  "push_notification": true,
  "notification_timing": "1일전,1시간전",
  "calendar_color": "#4285F4"
}
```

| 속성 | 타입 | 필수여부 | 설명 |
|------------|------|--------|------------|
| google_calendar_id | string | Yes | Google 캘린더 ID |
| calendar_name | string | No | 캘린더 이름 |
| auto_sync | boolean | No | 자동 동기화 여부 |
| sync_interval | string | No | 동기화 주기 (HOURLY/DAILY/WEEKLY) |
| email_notification | boolean | No | 이메일 알림 여부 |
| push_notification | boolean | No | 푸시 알림 여부 |
| notification_timing | string | No | 알림 시점 |
| calendar_color | string | No | 캘린더 색상 (HEX 코드) |

##### 응답
##### 성공 응답: 200 OK
```json
{
  "success": true,
  "message": "설정이 저장되었습니다",
  "settings": {
    "settings_id": 1,
    "google_calendar_id": "primary",
    "calendar_name": "스포츠 경기일정",
    "auto_sync": true,
    "sync_interval": "DAILY",
    "email_notification": true,
    "push_notification": true,
    "notification_timing": "1일전,1시간전",
    "calendar_color": "#4285F4",
    "updated_at": "2024-12-19T10:30:00Z"
  }
}
```

##### 사용 예시
```bash
curl -X PUT "https://api.example.com/api/v1/calendar/settings" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "google_calendar_id": "primary",
    "auto_sync": true,
    "sync_interval": "DAILY"
  }'
```

---

#### 엔드포인트: POST /api/v1/calendar/share

##### 개요
캘린더 공유 설정을 변경합니다. (선택 기능)

##### 요청 헤더
| 헤더명 | 필수여부 | 설명 |
|-----------|--------|------------|
| Authorization | Yes | Bearer 토큰 |
| Content-Type | Yes | application/json |

##### 요청 본문 (Request Body)
```json
{
  "is_shared": true,
  "share_with_email": "family@example.com",
  "role": "reader"
}
```

| 속성 | 타입 | 필수여부 | 설명 |
|------------|------|--------|------------|
| is_shared | boolean | Yes | 공유 여부 |
| share_with_email | string | No | 공유할 이메일 주소 |
| role | string | No | 권한 (reader/writer) |

##### 응답
##### 성공 응답: 200 OK
```json
{
  "success": true,
  "message": "캘린더가 공유되었습니다"
}
```

##### 사용 예시
```bash
curl -X POST "https://api.example.com/api/v1/calendar/share" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "is_shared": true,
    "share_with_email": "family@example.com",
    "role": "reader"
  }'
```

---

#### 엔드포인트: PUT /api/v1/calendar/notifications

##### 개요
알림 설정을 수정합니다.

##### 요청 헤더
| 헤더명 | 필수여부 | 설명 |
|-----------|--------|------------|
| Authorization | Yes | Bearer 토큰 |
| Content-Type | Yes | application/json |

##### 요청 본문 (Request Body)
```json
{
  "email_notification": true,
  "push_notification": true,
  "notification_timing": "1일전,1시간전"
}
```

| 속성 | 타입 | 필수여부 | 설명 |
|------------|------|--------|------------|
| email_notification | boolean | No | 이메일 알림 여부 |
| push_notification | boolean | No | 푸시 알림 여부 |
| notification_timing | string | No | 알림 시점 (예: "1일전,1시간전") |

##### 응답
##### 성공 응답: 200 OK
```json
{
  "success": true,
  "message": "알림 설정이 저장되었습니다",
  "notifications": {
    "email_notification": true,
    "push_notification": true,
    "notification_timing": "1일전,1시간전"
  }
}
```

##### 사용 예시
```bash
curl -X PUT "https://api.example.com/api/v1/calendar/notifications" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "email_notification": true,
    "push_notification": true,
    "notification_timing": "1일전,1시간전"
  }'
```

---

## 5. 데이터 모델

### 주요 데이터 구조

#### User (사용자)
```json
{
  "user_id": 1,
  "google_user_id": "123456789",
  "email": "user@example.com",
  "name": "홍길동",
  "profile_image_url": "https://lh3.googleusercontent.com/...",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "last_login_at": "2024-12-19T10:30:00Z"
}
```

#### Schedule (경기일정)
```json
{
  "schedule_id": 1,
  "team_id": 1,
  "team_name": "LG 트윈스",
  "game_date": "2024-03-15",
  "game_time": "18:30",
  "opponent_team": "KT 위즈",
  "venue_type": "HOME",
  "venue_name": "잠실야구장",
  "game_status": "SCHEDULED",
  "game_result": null,
  "score": null
}
```

#### CalendarSettings (캘린더 설정)
```json
{
  "settings_id": 1,
  "user_id": 1,
  "google_calendar_id": "primary",
  "calendar_name": "스포츠 경기일정",
  "auto_sync": true,
  "sync_interval": "DAILY",
  "email_notification": true,
  "push_notification": true,
  "notification_timing": "1일전,1시간전",
  "calendar_color": "#4285F4",
  "is_shared": false
}
```

### 데이터 타입 정의

| 타입 | 설명 | 예시 |
|------|------|------|
| integer | 정수 | 1, 100 |
| string | 문자열 | "홍길동" |
| boolean | 불리언 | true, false |
| date | 날짜 (YYYY-MM-DD) | "2024-03-15" |
| time | 시간 (HH:MM) | "18:30" |
| datetime | 날짜시간 (ISO 8601) | "2024-12-19T10:30:00Z" |

### 제약 조건

#### venue_type (장소 구분)
- `HOME`: 홈 경기
- `AWAY`: 원정 경기

#### game_status (경기 상태)
- `SCHEDULED`: 예정
- `IN_PROGRESS`: 진행중
- `FINISHED`: 종료
- `CANCELLED`: 취소

#### sync_interval (동기화 주기)
- `HOURLY`: 시간별
- `DAILY`: 일별
- `WEEKLY`: 주별

## 6. 에러 핸들링

### 에러 응답 형식

모든 에러 응답은 다음 형식을 따릅니다:

```json
{
  "error": "ERROR_CODE",
  "message": "에러 메시지",
  "details": {}
}
```

| 속성 | 타입 | 설명 |
|------------|------|------------|
| error | string | 에러 코드 |
| message | string | 사용자에게 표시할 에러 메시지 |
| details | object | 추가 에러 정보 (선택) |

### 에러 코드 목록

| HTTP 상태 코드 | 에러 코드 | 설명 |
|---------------|----------|------|
| 400 | `INVALID_REQUEST` | 잘못된 요청 |
| 400 | `INVALID_PARAMETER` | 유효하지 않은 파라미터 |
| 400 | `INVALID_TEAM` | 유효하지 않은 팀 ID |
| 400 | `INVALID_CALENDAR` | 유효하지 않은 캘린더 ID |
| 400 | `INVALID_CODE` | 유효하지 않은 OAuth 인증 코드 |
| 401 | `UNAUTHORIZED` | 인증이 필요합니다 |
| 401 | `AUTH_REQUIRED` | 인증 토큰이 필요합니다 |
| 401 | `OAUTH_TOKEN_EXPIRED` | OAuth 토큰이 만료되었습니다 |
| 403 | `FORBIDDEN` | 권한이 없습니다 |
| 404 | `NOT_FOUND` | 리소스를 찾을 수 없습니다 |
| 429 | `RATE_LIMIT_EXCEEDED` | API 사용 제한을 초과했습니다 |
| 500 | `INTERNAL_SERVER_ERROR` | 서버 내부 오류 |
| 500 | `OAUTH_ERROR` | OAuth 설정 오류 |
| 500 | `CRAWL_FAILED` | 크롤링 실패 |
| 500 | `CALENDAR_SYNC_FAILED` | 캘린더 동기화 실패 |

### 에러 응답 예시

#### 400 Bad Request
```json
{
  "error": "INVALID_PARAMETER",
  "message": "필수 파라미터가 누락되었습니다: team_id",
  "details": {
    "missing_fields": ["team_id"]
  }
}
```

#### 401 Unauthorized
```json
{
  "error": "UNAUTHORIZED",
  "message": "인증이 필요합니다",
  "details": {
    "code": "AUTH_REQUIRED"
  }
}
```

#### 429 Too Many Requests
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Google Calendar API 할당량을 초과했습니다. 잠시 후 다시 시도해주세요",
  "details": {
    "retry_after": 3600,
    "limit": 1000000,
    "remaining": 0
  }
}
```

#### 500 Internal Server Error
```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요",
  "details": {}
}
```

## 7. 요청 제한 (Rate Limit)

### API 사용 제한

현재는 개인 프로젝트 특성상 API 사용 제한을 적용하지 않습니다. 다만, 외부 API 호출에 대한 제한은 다음과 같습니다:

#### Google Calendar API 제한

- **초당 쿼리 제한**: 100 쿼리/초
- **일일 할당량**: 1,000,000 쿼리/일
- **할당량 초과 시**: HTTP 429 에러 반환

### 제한 초과 시 처리

Google Calendar API 할당량을 초과한 경우:

1. HTTP 429 상태 코드 반환
2. `retry_after` 헤더에 재시도 가능 시간(초) 포함
3. 에러 응답에 할당량 정보 포함

```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Google Calendar API 할당량을 초과했습니다. 잠시 후 다시 시도해주세요",
  "details": {
    "retry_after": 3600,
    "limit": 1000000,
    "remaining": 0
  }
}
```

## 8. 변경 이력

| 버전 | 날짜 | 변경 내용 | Breaking Changes |
|------|------|----------|------------------|
| v1.0.0 | 2025-11-05 | 초기 API 명세서 작성 | - |

### Breaking Changes 정책

- **메이저 버전 업데이트**: 호환성 깨짐 변경 시 버전 증가 (예: v1 → v2)
- **마이너 버전 업데이트**: 하위 호환성 유지하는 기능 추가 시 버전 증가 (예: v1.0 → v1.1)
- **패치 버전 업데이트**: 버그 수정 시 버전 증가 (예: v1.0.0 → v1.0.1)

### 변경 알림

API 변경 사항은 다음 방법으로 공지됩니다:

1. API 문서에 변경 이력 기록
2. 주요 변경 사항은 이메일 또는 시스템 알림으로 공지 (향후 확장 시)

---

**작성일**: 2025-11-05  
**작성자**: AI API 설계 전문가  
**상태**: 설계 완료

**참고**: 이 API 명세서는 ADR 및 데이터베이스 설계서를 기반으로 작성되었습니다. 실제 구현 시 프로젝트 요구사항에 맞게 조정이 필요할 수 있습니다.


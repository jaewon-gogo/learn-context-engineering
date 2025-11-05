# 스포츠팀 경기일정 캘린더 웹사이트 UI 개념 설계 및 프로토타입

## 개요

이 문서는 요구사항 정의서, ADR, 데이터베이스 설계, API 명세서를 기반으로 화면 설계를 시작하고, 클라이언트와의 합의를 위한 프로토타입(80% 품질)을 제작하는 프로세스를 정의합니다.

## 기본 방침

### 단계적 접근 방식

1. **Phase 1: 요구사항 분석** - 기존 문서에서 UI 요구사항 추출
2. **Phase 2: 와이어프레임 설계** - 화면 구성의 개략 설계
3. **Phase 3: 프로토타입 구현** - 체험 가능한 형태로 구현(80% 품질)
4. **Phase 4: 클라이언트 합의** - 프로토타입을 이용한 합의 형성

### 품질 수준 정의

- **80% 품질**: 클라이언트 체험 및 합의에 필요한 수준
  - 핵심 기능은 동작 확인 가능해야 함
  - 시각적 완성도는 실제 구현 수준에 근접
  - 성능/보안은 간이 구현으로 대응

## 기술 스택

### 프레임워크 및 라이브러리

```json
{
  "framework": "Next.js 14+ (App Router)",
  "ui_library": "shadcn/ui + Tailwind CSS",
  "calendar_library": "react-big-calendar 또는 fullcalendar-react",
  "state_management": "React hooks (useState, useEffect, useReducer)",
  "data_fetching": "fetch API (모의 구현 가능)",
  "styling": "Tailwind CSS + CSS Modules",
  "icons": "lucide-react 또는 react-icons"
}
```

### 개발환경 요구사항

- **VSCode Live Server 지원**: 즉시 실행 및 확인 가능
- **Hot Reload**: 실시간 반영
- **반응형 UI**: 모바일 및 데스크톱 동시 대응
- **브라우저 지원**: Chrome, Safari, Firefox (최신 2개 버전)

---

## Phase 1: 요구사항 분석

### 1.1 기존 문서 분석

#### 분석 대상 문서

- **sports-schedule-calendar-requirements.md**: 기능/비기능 요구사항
- **sports-schedule-calendar-adr.md**: 아키텍처 결정 사항
- **sports-schedule-calendar-database.md**: 데이터 구조 및 관계
- **sports-schedule-calendar-api-spec.md**: API 명세 및 데이터 흐름

#### 추출 항목

1. **사용자 역할 및 권한**
   - 주요 사용자: 10살 아동 (최종 사용자)
   - 요청자: 부모 (프로젝트 발의자)
   - 인증: Google OAuth 2.0 (모든 사용자)

2. **주요 기능 및 화면 전환**
   - Google OAuth 로그인
   - 스포츠 종목 및 팀 선택
   - 경기일정 캘린더 표시
   - Google 캘린더 연동 설정
   - 알림 설정

3. **데이터 표시 및 입력 항목**
   - 스포츠 종목 선택 (드롭다운/버튼)
   - 팀 선택 (드롭다운/검색)
   - 경기일정 캘린더 (월별 그리드)
   - 경기 상세 정보 (모달/사이드바)
   - 캘린더 연동 설정 (폼)

4. **업무 흐름 및 조작 절차**
   - 로그인 → 팀 선택 → 캘린더 표시 → 캘린더 연동 설정

### 1.2 UI 요구사항 정리

#### UI 요구사항 매트릭스

| 기능 | 화면 | 입력항목 | 출력 항목 | 권한 | 우선순위 | 특수 요구사항 |
|------|------|----------|----------|------|--------|--------------|
| Google 로그인 | `/login` | - | 사용자 정보 | 전체 사용자 | 높음 | Google Design 가이드 준수 |
| 대시보드 | `/dashboard` | - | 경기일정 캘린더 | 인증 사용자 | 높음 | 10살 아동 친화적 UI |
| 팀 선택 | `/dashboard` | 스포츠, 팀 선택 | - | 인증 사용자 | 높음 | 직관적인 선택 UI |
| 캘린더 표시 | `/dashboard` | - | 경기일정 목록 | 인증 사용자 | 높음 | 월별 캘린더 그리드 |
| 경기 상세 | Modal | - | 경기 정보 | 인증 사용자 | 중간 | 클릭 시 모달 표시 |
| 캘린더 연동 설정 | `/settings/calendar` | 캘린더 선택, 알림 설정 | 설정 상태 | 인증 사용자 | 중간 | 간단한 설정 UI |
| 알림 설정 | `/settings/notifications` | 알림 옵션 | 설정 상태 | 인증 사용자 | 낮음 | 토글 스위치 |

#### 사용자 특성별 요구사항

**10살 아동 친화적 UI**:
- 단순성: 복잡한 메뉴나 설정 최소화
- 시각적 명확성: 큰 아이콘, 명확한 색상, 읽기 쉬운 폰트
- 즉각적 피드백: 버튼 클릭 시 즉각적인 반응
- 오류 방지: 실수로 인한 잘못된 조작 최소화
- 색상: 밝고 선명한 색상 팔레트
- 아이콘: 스포츠 관련 아이콘 사용

**반응형 디자인**:
- 모바일: 터치 친화적 인터페이스, 스와이프 제스처 지원
- 데스크톱: 넓은 화면 활용, 마우스 호버 효과

---

## Phase 2: 와이어프레임 설계

### 2.1 화면 구성 설계

#### 전체 화면 및 계층 구조

```
/
├── /login (로그인 화면)
│   └── Google OAuth 로그인 버튼
│
├── /dashboard (대시보드 - 메인 화면)
│   ├── 헤더 (로고, 사용자 정보, 설정)
│   ├── 팀 선택 섹션
│   │   ├── 스포츠 종목 선택
│   │   └── 팀 선택
│   ├── 캘린더 뷰
│   │   ├── 월 네비게이션 (이전/다음)
│   │   ├── 캘린더 그리드
│   │   └── 경기일정 표시
│   └── 캘린더 연동 버튼
│
├── /settings (설정 화면)
│   ├── /settings/calendar (캘린더 연동 설정)
│   │   ├── 캘린더 선택
│   │   ├── 자동 동기화 설정
│   │   └── 동기화 주기 설정
│   └── /settings/notifications (알림 설정)
│       ├── 이메일 알림
│       ├── 푸시 알림
│       └── 알림 시점 설정
│
└── Modal (경기 상세 정보)
    ├── 경기 날짜/시간
    ├── 상대팀
    ├── 장소
    └── 경기 상태
```

### 2.2 레이아웃 구성 요소

#### 공통 레이아웃

1. **고정 헤더** (데스크톱)
   - 좌측: 로고/제목
   - 중앙: 네비게이션 (선택)
   - 우측: 사용자 프로필, 설정, 로그아웃

2. **모바일 헤더**
   - 좌측: 햄버거 메뉴
   - 중앙: 로고/제목
   - 우측: 사용자 프로필

3. **사이드바** (데스크톱, 선택)
   - 메인 메뉴
   - 빠른 설정

4. **메인 콘텐츠**
   - 핵심 화면 영역
   - 반응형 그리드 레이아웃

5. **푸터** (선택)
   - 보조 정보
   - 링크

### 2.3 컴포넌트 설계

#### 공통 컴포넌트

| 컴포넌트명 | 설명 | 위치 |
|-----------|------|------|
| Header | 사이트 공통 헤더 | `components/layout/Header.tsx` |
| Sidebar | 메인 메뉴 (데스크톱) | `components/layout/Sidebar.tsx` |
| Button | 각종 버튼 (Primary, Secondary, Danger) | `components/ui/button.tsx` |
| Input | 폼 입력 (Text, Email, Select) | `components/ui/input.tsx` |
| Select | 선택 드롭다운 | `components/ui/select.tsx` |
| Modal | 모달 대화상자 | `components/ui/modal.tsx` |
| Card | 정보 카드 | `components/ui/card.tsx` |
| Calendar | 캘린더 컴포넌트 | `components/features/Calendar.tsx` |

#### 화면별 컴포넌트

| 컴포넌트명 | 설명 | 위치 |
|-----------|------|------|
| GoogleLoginButton | Google 로그인 버튼 | `components/features/GoogleLoginButton.tsx` |
| SportSelector | 스포츠 종목 선택 | `components/features/SportSelector.tsx` |
| TeamSelector | 팀 선택 | `components/features/TeamSelector.tsx` |
| ScheduleCalendar | 경기일정 캘린더 | `components/features/ScheduleCalendar.tsx` |
| GameDetailModal | 경기 상세 정보 모달 | `components/features/GameDetailModal.tsx` |
| CalendarSyncSettings | 캘린더 연동 설정 | `components/features/CalendarSyncSettings.tsx` |
| NotificationSettings | 알림 설정 | `components/features/NotificationSettings.tsx` |

### 2.4 화면별 상세 설계

#### 2.4.1 로그인 화면 (`/login`)

**레이아웃**:
```
┌─────────────────────────────────┐
│                                 │
│      [로고/제목]                │
│                                 │
│   "스포츠 경기일정 캘린더"      │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │  [Google 로그인 버튼]    │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│   간단한 설명 텍스트            │
│                                 │
└─────────────────────────────────┘
```

**요구사항**:
- Google Design 가이드를 따르는 로그인 버튼
- 중앙 정렬
- 간단한 설명 텍스트
- 반응형 디자인

#### 2.4.2 대시보드 (`/dashboard`)

**레이아웃** (데스크톱):
```
┌──────────────────────────────────────────────────┐
│ [로고]           [사용자 프로필] [설정] [로그아웃] │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ 스포츠 종목: [야구 ▼]                    │  │
│  │ 팀 선택: [LG 트윈스 ▼]  [검색]           │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  [◀ 이전] 2024년 3월  [다음 ▶]           │  │
│  ├──────────────────────────────────────────┤  │
│  │ 일 월 화 수 목 금 토                      │  │
│  │     1  2  3  4  5  6  7                   │  │
│  │  8  9 10 11 12 13 14                      │  │
│  │ 15 🏟️16 17 18 19 20 21                    │  │
│  │ 22 23 24 25 26 27 28                      │  │
│  │ 29 30 31                                   │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  [📅 Google 캘린더에 동기화]                    │
│                                                  │
└──────────────────────────────────────────────────┘
```

**레이아웃** (모바일):
```
┌─────────────────────┐
│ [☰] [로고] [👤]     │
├─────────────────────┤
│                     │
│ 스포츠: [야구 ▼]    │
│ 팀: [LG 트윈스 ▼]   │
│                     │
│ [◀] 2024년 3월 [▶]  │
│                     │
│ 일 월 화 수 목 금 토 │
│     1  2  3  4  5  6│
│  7  8  9 10 11 12 13│
│ 14 15🏟️16 17 18 19 20│
│ 21 22 23 24 25 26 27│
│ 28 29 30 31         │
│                     │
│ [📅 동기화]         │
│                     │
└─────────────────────┘
```

**요구사항**:
- 팀 선택 섹션: 상단에 배치, 직관적인 선택 UI
- 캘린더 뷰: 월별 그리드, 경기일정 아이콘 표시
- 경기일정 클릭 시 상세 정보 모달 표시
- Google 캘린더 동기화 버튼: 명확한 위치

#### 2.4.3 경기 상세 모달

**레이아웃**:
```
┌──────────────────────────┐
│ 경기 상세 정보        [X] │
├──────────────────────────┤
│                          │
│ 📅 2024년 3월 15일       │
│ ⏰ 18:30                  │
│                          │
│ 🏟️ LG 트윈스 vs KT 위즈   │
│                          │
│ 📍 잠실야구장 (홈)        │
│                          │
│ 상태: 예정               │
│                          │
│ [Google 캘린더에 추가]    │
│                          │
└──────────────────────────┘
```

**요구사항**:
- 큰 아이콘과 명확한 텍스트
- 간단한 정보 표시
- Google 캘린더에 직접 추가 버튼

#### 2.4.4 캘린더 연동 설정 (`/settings/calendar`)

**레이아웃**:
```
┌──────────────────────────────────┐
│ 캘린더 연동 설정              [←] │
├──────────────────────────────────┤
│                                  │
│ Google 캘린더 선택:             │
│ [기본 캘린더 ▼]                  │
│                                  │
│ 자동 동기화:                     │
│ [ON/OFF 토글]                    │
│                                  │
│ 동기화 주기:                     │
│ [일별 ▼]                         │
│                                  │
│ 알림 설정:                       │
│ ☑ 이메일 알림                    │
│ ☑ 푸시 알림                      │
│                                  │
│ 알림 시점:                       │
│ ☑ 1일 전                         │
│ ☑ 1시간 전                       │
│                                  │
│ [저장] [취소]                    │
│                                  │
└──────────────────────────────────┘
```

**요구사항**:
- 간단한 설정 폼
- 토글 스위치 사용
- 명확한 레이블

---

## Phase 3: 프로토타입 구현

### 3.1 프로젝트 초기화

#### 프로젝트 생성 명령어

```bash
# Next.js 프로젝트 만들기
npx create-next-app@latest sports-schedule-calendar-prototype \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

# 프로젝트 디렉토리로 이동
cd sports-schedule-calendar-prototype

# shadcn/ui 초기화
npx shadcn-ui@latest init

# 기본 구성 요소 추가
npx shadcn-ui@latest add button input card select dialog toggle switch
```

### 3.2 디렉토리 구조

```
sports-schedule-calendar-prototype/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx
│   │   │   └── notifications/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/ (shadcn/ui 컴포넌트)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── features/
│   │       ├── GoogleLoginButton.tsx
│   │       ├── SportSelector.tsx
│   │       ├── TeamSelector.tsx
│   │       ├── ScheduleCalendar.tsx
│   │       ├── GameDetailModal.tsx
│   │       ├── CalendarSyncSettings.tsx
│   │       └── NotificationSettings.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── api.ts (모의 구현)
│   │   └── mockData.ts
│   ├── types/
│   │   └── index.ts
│   └── hooks/
│       ├── useAuth.ts
│       └── useSchedule.ts
└── public/
    └── images/
```

### 3.3 구현 가이드라인

#### 3.3.1 반응형 구현 예시

```tsx
// src/components/features/ScheduleCalendar.tsx
import { Card } from "@/components/ui/card";

export function ScheduleCalendar() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-2 p-4">
      {/* 요일 헤더 */}
      <div className="hidden md:grid md:grid-cols-7 gap-2">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div key={day} className="text-center font-semibold text-sm">
            {day}
          </div>
        ))}
      </div>
      
      {/* 캘린더 그리드 */}
      {/* 모바일: 1열, 데스크톱: 7열 */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {/* 날짜 셀들 */}
      </div>
    </div>
  );
}
```

#### 3.3.2 모의 데이터 구현

```typescript
// src/lib/mockData.ts
export const mockSports = [
  { id: 1, name: "야구", display_order: 1, is_active: true },
  { id: 2, name: "축구", display_order: 2, is_active: true },
  { id: 3, name: "농구", display_order: 3, is_active: true },
];

export const mockTeams = [
  { id: 1, sports_id: 1, name: "LG 트윈스", is_active: true },
  { id: 2, sports_id: 1, name: "삼성 라이온즈", is_active: true },
  { id: 3, sports_id: 1, name: "KT 위즈", is_active: true },
];

export const mockSchedules = [
  {
    schedule_id: 1,
    team_id: 1,
    team_name: "LG 트윈스",
    game_date: "2024-03-15",
    game_time: "18:30",
    opponent_team: "KT 위즈",
    venue_type: "HOME",
    venue_name: "잠실야구장",
    game_status: "SCHEDULED",
  },
  {
    schedule_id: 2,
    team_id: 1,
    team_name: "LG 트윈스",
    game_date: "2024-03-20",
    game_time: "18:30",
    opponent_team: "삼성 라이온즈",
    venue_type: "AWAY",
    venue_name: "대구삼성라이온즈파크",
    game_status: "SCHEDULED",
  },
];

// src/lib/api.ts (간단한 구현)
export async function fetchSports() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockSports;
}

export async function fetchTeams(sportsId: number) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockTeams.filter((team) => team.sports_id === sportsId);
}

export async function fetchSchedules(teamId: number, startDate: string, endDate: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockSchedules.filter(
    (schedule) =>
      schedule.team_id === teamId &&
      schedule.game_date >= startDate &&
      schedule.game_date <= endDate
  );
}
```

#### 3.3.3 상태 관리 (간이 구현)

```tsx
// src/hooks/useAuth.ts
import { useState, useEffect } from "react";

export interface User {
  user_id: number;
  email: string;
  name: string;
  profile_image_url?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async () => {
    // 모의 Google OAuth 로그인
    const mockUser: User = {
      user_id: 1,
      email: "user@example.com",
      name: "홍길동",
      profile_image_url: "https://via.placeholder.com/150",
    };
    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return { user, login, logout, loading };
}
```

### 3.4 주요 컴포넌트 구현 예시

#### 3.4.1 Google 로그인 버튼

```tsx
// src/components/features/GoogleLoginButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export function GoogleLoginButton() {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    await login();
    router.push("/dashboard");
  };

  return (
    <Button
      onClick={handleLogin}
      className="w-full max-w-sm h-12 text-lg font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-md"
      size="lg"
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Google로 로그인
    </Button>
  );
}
```

#### 3.4.2 캘린더 컴포넌트

```tsx
// src/components/features/ScheduleCalendar.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameDetailModal } from "./GameDetailModal";
import type { Schedule } from "@/types";

interface ScheduleCalendarProps {
  schedules: Schedule[];
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
}

export function ScheduleCalendar({
  schedules,
  currentMonth,
  onMonthChange,
}: ScheduleCalendarProps) {
  const [selectedGame, setSelectedGame] = useState<Schedule | null>(null);

  // 날짜별 경기일정 그룹화
  const schedulesByDate = schedules.reduce((acc, schedule) => {
    const date = schedule.game_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  // 캘린더 그리드 생성 로직
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <Card className="p-4">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => {
            const prevMonth = new Date(currentMonth);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
            onMonthChange(prevMonth);
          }}
        >
          ◀ 이전
        </Button>
        <h2 className="text-xl font-bold">
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </h2>
        <Button
          variant="outline"
          onClick={() => {
            const nextMonth = new Date(currentMonth);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            onMonthChange(nextMonth);
          }}
        >
          다음 ▶
        </Button>
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 gap-2">
        {/* 요일 헤더 */}
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div key={day} className="text-center font-semibold text-sm p-2">
            {day}
          </div>
        ))}

        {/* 날짜 셀 */}
        {days.map((day, index) => {
          const dateStr = day
            ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            : null;
          const daySchedules = dateStr ? schedulesByDate[dateStr] || [] : [];

          return (
            <div
              key={index}
              className={`min-h-20 p-2 border rounded-md ${
                day ? "bg-white" : "bg-gray-50"
              }`}
            >
              {day && (
                <>
                  <div className="text-sm font-medium mb-1">{day}</div>
                  {daySchedules.map((schedule) => (
                    <button
                      key={schedule.schedule_id}
                      onClick={() => setSelectedGame(schedule)}
                      className="w-full text-left text-xs p-1 bg-blue-100 hover:bg-blue-200 rounded mb-1"
                    >
                      🏟️ {schedule.opponent_team}
                    </button>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* 경기 상세 모달 */}
      {selectedGame && (
        <GameDetailModal
          schedule={selectedGame}
          open={!!selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </Card>
  );
}
```

### 3.5 디자인 시스템

#### 3.5.1 색상 팔레트

```css
/* tailwind.config.js에서 설정 */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        sports: {
          baseball: '#FF6B35',
          soccer: '#4ECDC4',
          basketball: '#FFE66D',
        },
      },
    },
  },
};
```

#### 3.5.2 타이포그래피

```css
/* fonts 설정 */
font-family: {
  heading: ['Inter', 'sans-serif'],
  body: ['Inter', 'sans-serif'],
}
```

#### 3.5.3 간격 시스템

```css
/* Tailwind 기본 spacing 사용 */
spacing: {
  '1': '0.25rem',
  '2': '0.5rem',
  '4': '1rem',
  '8': '2rem',
}
```

---

## Phase 4: 클라이언트 합의

### 4.1 데모 환경 준비

#### 데모 실행 절차

1. 프로젝트 디렉토리로 이동
   ```bash
   cd sports-schedule-calendar-prototype
   ```

2. 의존성 설치
   ```bash
   npm install
   ```

3. 개발 서버 시작
   ```bash
   npm run dev
   ```

4. 브라우저에서 접속
   - http://localhost:3000 접속
   - 주요 화면·기능을 순차적으로 데모

#### 데모 시나리오

1. **로그인 화면**
   - Google 로그인 버튼 표시 확인
   - 버튼 클릭 시 로그인 처리 (모의)

2. **대시보드**
   - 스포츠 종목 선택 기능 확인
   - 팀 선택 기능 확인
   - 캘린더 뷰 표시 확인
   - 경기일정 클릭 시 상세 정보 모달 확인

3. **캘린더 연동 설정**
   - 캘린더 선택 UI 확인
   - 자동 동기화 설정 확인
   - 알림 설정 확인

4. **반응형 대응**
   - 모바일 화면에서 레이아웃 확인
   - 데스크톱 화면에서 레이아웃 확인

### 4.2 피드백 수집

#### 피드백 항목

- [ ] 화면 레이아웃 디자인
  - 전체적인 레이아웃 구성
  - 색상 및 스타일
  - 아이콘 및 이미지

- [ ] 조작 흐름 사용성
  - 로그인 → 대시보드 → 캘린더 표시 흐름
  - 팀 선택 편의성
  - 경기 상세 정보 확인 편의성

- [ ] 표시 항목·정보의 과부족
  - 필요한 정보가 모두 표시되는지
  10살 아동이 이해하기 쉬운지
  - 불필요한 정보가 없는지

- [ ] 반응형 대응
  - 모바일 화면에서의 사용성
  - 데스크톱 화면에서의 사용성
  - 터치 인터페이스 적합성

- [ ] 추가요망·변경점
  - 추가 기능 요청
  - UI/UX 개선 사항
  - 버그 및 오류

#### 합의 사항 기록

프로토타입 검토 후 다음 사항을 기록합니다:

- **승인된 화면 및 기능**
  - 로그인 화면
  - 대시보드
  - 캘린더 뷰
  - 경기 상세 모달
  - 캘린더 연동 설정

- **수정이 필요한 항목**
  - 레이아웃 조정
  - 색상 변경
  - 컴포넌트 위치 변경

- **추가요구사항**
  - 새로운 기능 요청
  - 향후 확장 계획

- **다음 단계로의 인계 사항**
  - 프로토타입 코드
  - 디자인 시스템
  - 개선 필요 사항

---

## 산출물 및 전달사항

### Phase 3 단계 완료 시 산출물

1. **작동하는 프로토타입**
   - Next.js + shadcn/ui 기반 프로토타입
   - 핵심 기능 동작 확인 가능
   - 모의 데이터로 체험 가능

2. **화면 설계서**
   - 와이어프레임 컴포넌트 사양
   - 레이아웃 구조
   - 컴포넌트 목록

3. **기술사양서**
   - 사용 기술 스택
   - 구현 방침
   - 디렉토리 구조

4. **데모 환경**
   - VSCode Live Server 지원
   - 로컬 개발 서버 실행 가능

### doc06에 대한 인수

1. **합의된 화면 사양**
   - 클라이언트 승인된 디자인
   - 수정 사항 반영

2. **프로토타입 코드**
   - 80% 품질 구현 코드
   - 컴포넌트 구조
   - 상태 관리 방식

3. **기술 스택**
   - 확정된 기술 선택
   - 라이브러리 버전

4. **개선 요망**
   - 본 구현에서 대응해야 할 품질 향상 항목
   - 성능 최적화
   - 보안 강화
   - 에러 처리 개선

---

## 주의사항

### 품질 기준 명확화

- **80% 품질**: 체험·합의 형성에 필요한 충분한 수준
- **성능**: 기본 동작 확인 레벨 (모의 데이터 사용)
- **보안**: 개발 환경에서의 간이 구현 (실제 OAuth는 미구현)
- **오류 처리**: 주요 사례만 지원

### 클라이언트 소통 원칙

- 프로토타입의 위치 지정을 사전 설명
  - "이것은 프로토타입이며, 실제 구현과는 다를 수 있습니다"
- 본 구현과의 품질 차이에 대한 합의
- 피드백 수집 및 기록 철저
- 다음 단계에 대한 기대치 설정을 명확화

### 10살 아동 친화적 UI 고려사항

- **큰 버튼**: 터치하기 쉬운 크기 (최소 44x44px)
- **명확한 색상**: 밝고 대비가 높은 색상 사용
- **간단한 텍스트**: 어려운 단어 최소화
- **즉각적 피드백**: 클릭 시 즉시 반응
- **오류 방지**: 실수로 인한 잘못된 조작 최소화
- **시각적 힌트**: 아이콘과 색상으로 정보 전달

---

**작성일**: 2025-11-05  
**작성자**: UI 설계 전문가  
**상태**: 설계 완료

**참고**: 이 문서는 ADR, 데이터베이스 설계, API 명세서를 기반으로 작성되었습니다. 실제 프로토타입 구현 시 프로젝트 요구사항에 맞게 조정이 필요할 수 있습니다.


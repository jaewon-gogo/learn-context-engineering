# 스포츠팀 경기일정 캘린더 웹사이트

## 프로젝트 개요

10살 아동이 좋아하는 스포츠팀의 경기일정을 자동으로 수집하여 캘린더 형태로 시각화하고, Google 캘린더에 자동으로 동기화하는 웹 애플리케이션입니다.

## 기술 스택

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- shadcn/ui + Tailwind CSS
- React Hooks

### Backend
- Node.js 18+
- Express.js
- TypeScript
- SQLite

### 인프라
- Vercel (Frontend + Backend)
- Google OAuth 2.0
- Google Calendar API

## 프로젝트 구조

```
sports-schedule-calendar/
├── frontend/          # Next.js 프론트엔드
├── backend/           # Express.js 백엔드
└── shared/            # 공유 타입 정의
```

## 개발 환경 설정

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 프론트엔드 설정
cd frontend
npm install
npm run dev

# 백엔드 설정
cd backend
npm install
npm run dev
```

## 환경 변수

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

## 문서

상세한 설계 문서는 `/MD` 디렉토리를 참고하세요.


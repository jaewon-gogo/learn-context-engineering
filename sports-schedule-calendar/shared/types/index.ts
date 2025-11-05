/**
 * 공유 타입 정의
 * Frontend와 Backend에서 공통으로 사용하는 타입
 */

// 사용자 관련 타입
export interface User {
  user_id: number;
  google_user_id: string;
  email: string;
  name: string;
  profile_image_url?: string;
  is_active: boolean;
  created_at: string;
  last_login_at?: string;
}

// 스포츠 관련 타입
export interface Sport {
  sports_id: number;
  sports_name: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// 팀 관련 타입
export interface Team {
  team_id: number;
  sports_id: number;
  team_name: string;
  team_official_name?: string;
  crawl_url: string;
  crawl_config?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// 경기일정 관련 타입
export interface Schedule {
  schedule_id: number;
  team_id: number;
  team_name?: string;
  game_date: string; // YYYY-MM-DD
  game_time?: string; // HH:MM
  opponent_team: string;
  venue_type: 'HOME' | 'AWAY';
  venue_name?: string;
  game_status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
  game_result?: string;
  score?: string;
  crawled_at: string;
  updated_at?: string;
}

// 캘린더 설정 관련 타입
export interface CalendarSettings {
  settings_id: number;
  user_id: number;
  google_calendar_id: string;
  calendar_name: string;
  auto_sync: boolean;
  sync_interval: 'HOURLY' | 'DAILY' | 'WEEKLY';
  email_notification: boolean;
  push_notification: boolean;
  notification_timing: string;
  calendar_color?: string;
  is_shared: boolean;
  created_at: string;
  updated_at?: string;
}

// 캘린더 동기화 이력 관련 타입
export interface CalendarSyncHistory {
  sync_id: number;
  user_id: number;
  schedule_id: number;
  google_event_id?: string;
  sync_status: 'SUCCESS' | 'FAILED' | 'PENDING';
  synced_at: string;
  error_message?: string;
  error_code?: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// OAuth 토큰 타입
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  expires_in?: number;
}

// 크롤링 이력 타입
export interface CrawlHistory {
  crawl_id: number;
  team_id: number;
  started_at: string;
  finished_at?: string;
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
  schedules_found: number;
  schedules_saved: number;
  error_message?: string;
}

// Google Calendar 관련 타입
export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  accessRole?: string;
}

// 동기화 결과 타입
export interface SyncResult {
  success: boolean;
  synced_count: number;
  failed_count: number;
  errors?: Array<{
    schedule_id: number;
    error_message: string;
  }>;
}


/**
 * Level 1: 캘린더 동기화 서비스 (비즈니스 로직 단위)
 * Mock 기반 구현 - 데이터 변환 및 검증 로직만 구현
 */

import type { Schedule, GoogleCalendar, SyncResult } from '@shared/types';
import { combineDateTime, formatDate, formatTime } from '../utils/dateFormatter';

/**
 * 경기일정을 Google Calendar 이벤트 형식으로 변환
 * @param schedule 경기일정 데이터
 * @returns Google Calendar 이벤트 데이터
 */
export function convertScheduleToCalendarEvent(schedule: Schedule): {
  summary: string;
  description: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: string;
} {
  const startDateTime = combineDateTime(
    schedule.game_date,
    schedule.game_time || '18:00'
  );
  const endDateTime = new Date(startDateTime);
  endDateTime.setHours(endDateTime.getHours() + 2); // 기본 2시간 경기

  const summary = `${schedule.team_name || 'Team'} vs ${schedule.opponent_team}`;
  const description = `경기일정: ${schedule.venue_type === 'HOME' ? '홈' : '원정'} 경기`;
  const location = schedule.venue_name;

  return {
    summary,
    description,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'Asia/Seoul',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'Asia/Seoul',
    },
    location,
  };
}

/**
 * Google Calendar 이벤트 ID 생성 (Mock 구현)
 * @param scheduleId 경기일정 ID
 * @param userId 사용자 ID
 * @returns 생성된 이벤트 ID
 */
export function generateEventId(scheduleId: number, userId: number): string {
  return `event_${userId}_${scheduleId}_${Date.now()}`;
}

/**
 * Rate Limiting 체크 (초당 요청 수 제한)
 * @param requestCount 현재 요청 수
 * @param maxRequests 최대 요청 수 (기본값: 100)
 * @returns 요청 가능 여부
 */
export function checkRateLimit(requestCount: number, maxRequests: number = 100): boolean {
  return requestCount < maxRequests;
}

/**
 * Rate Limiting 대기 시간 계산 (Exponential Backoff)
 * @param retryCount 재시도 횟수
 * @param baseDelay 기본 대기 시간 (밀리초, 기본값: 1000)
 * @returns 대기 시간 (밀리초)
 */
export function calculateBackoffDelay(retryCount: number, baseDelay: number = 1000): number {
  return Math.min(baseDelay * Math.pow(2, retryCount), 60000); // 최대 60초
}

/**
 * 동기화 결과 생성
 * @param syncedCount 동기화 성공 수
 * @param failedCount 동기화 실패 수
 * @param errors 에러 목록 (선택)
 * @returns 동기화 결과
 */
export function createSyncResult(
  syncedCount: number,
  failedCount: number,
  errors?: Array<{ schedule_id: number; error_message: string }>
): SyncResult {
  return {
    success: failedCount === 0,
    synced_count: syncedCount,
    failed_count: failedCount,
    errors: errors || [],
  };
}

/**
 * 배치 동기화 요청 생성 (Rate Limit 고려)
 * @param schedules 동기화할 경기일정 목록
 * @param batchSize 배치 크기 (기본값: 10)
 * @returns 배치로 나뉜 경기일정 목록
 */
export function createSyncBatches(
  schedules: Schedule[],
  batchSize: number = 10
): Schedule[][] {
  const batches: Schedule[][] = [];
  for (let i = 0; i < schedules.length; i += batchSize) {
    batches.push(schedules.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * 캘린더 ID 검증
 * @param calendarId 캘린더 ID
 * @returns 유효성 여부
 */
export function validateCalendarId(calendarId: string): boolean {
  // Google Calendar ID 형식: 이메일 형식 또는 특수 ID
  return calendarId.length > 0 && (calendarId.includes('@') || calendarId.includes('calendar.google.com'));
}

/**
 * 동기화 상태 확인을 위한 데이터 변환
 * @param syncResults 동기화 결과 배열
 * @returns 통계 정보
 */
export function calculateSyncStatistics(syncResults: SyncResult[]): {
  total_synced: number;
  total_failed: number;
  success_rate: number;
} {
  const totalSynced = syncResults.reduce((sum, result) => sum + result.synced_count, 0);
  const totalFailed = syncResults.reduce((sum, result) => sum + result.failed_count, 0);
  const total = totalSynced + totalFailed;
  const successRate = total > 0 ? (totalSynced / total) * 100 : 0;

  return {
    total_synced: totalSynced,
    total_failed: totalFailed,
    success_rate: Math.round(successRate * 100) / 100,
  };
}

/**
 * Google Calendar 목록 필터링 (접근 가능한 캘린더만)
 * @param calendars 캘린더 목록
 * @param accessRoles 접근 가능한 역할 목록 (기본값: ['owner', 'writer'])
 * @returns 필터링된 캘린더 목록
 */
export function filterAccessibleCalendars(
  calendars: GoogleCalendar[],
  accessRoles: string[] = ['owner', 'writer']
): GoogleCalendar[] {
  return calendars.filter((calendar) => {
    const role = calendar.accessRole?.toLowerCase();
    return role && accessRoles.includes(role);
  });
}


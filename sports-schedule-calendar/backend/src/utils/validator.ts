/**
 * Level 1: 입력값 검증 유틸리티
 */

import { z } from 'zod';

/**
 * 이메일 형식 검증
 */
export const emailSchema = z.string().email('유효한 이메일 주소를 입력하세요');

/**
 * 날짜 형식 검증 (YYYY-MM-DD)
 */
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)');

/**
 * 시간 형식 검증 (HH:MM)
 */
export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '시간 형식이 올바르지 않습니다 (HH:MM)');

/**
 * URL 형식 검증
 */
export const urlSchema = z.string().url('유효한 URL을 입력하세요');

/**
 * 사용자 ID 검증
 */
export const userIdSchema = z.number().int().positive('유효한 사용자 ID를 입력하세요');

/**
 * 팀 ID 검증
 */
export const teamIdSchema = z.number().int().positive('유효한 팀 ID를 입력하세요');

/**
 * 경기일정 조회 파라미터 검증
 */
export const scheduleQuerySchema = z.object({
  team_id: teamIdSchema.optional(),
  start_date: dateSchema.optional(),
  end_date: dateSchema.optional(),
});

/**
 * 캘린더 동기화 요청 검증
 */
export const calendarSyncSchema = z.object({
  calendar_id: z.string().min(1, '캘린더 ID가 필요합니다'),
  team_ids: z.array(teamIdSchema).min(1, '최소 1개 이상의 팀을 선택하세요'),
  start_date: dateSchema,
  end_date: dateSchema,
}).refine((data) => {
  return new Date(data.start_date) <= new Date(data.end_date);
}, {
  message: '시작 날짜는 종료 날짜보다 이전이어야 합니다',
});

/**
 * 경기일정 데이터 검증
 */
export const scheduleDataSchema = z.object({
  team_id: teamIdSchema,
  game_date: dateSchema,
  game_time: timeSchema.optional(),
  opponent_team: z.string().min(1, '상대팀명이 필요합니다'),
  venue_type: z.enum(['HOME', 'AWAY'], {
    errorMap: () => ({ message: 'venue_type은 HOME 또는 AWAY여야 합니다' }),
  }),
  venue_name: z.string().optional(),
  game_status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'FINISHED', 'CANCELLED']).optional(),
  game_result: z.string().optional(),
  score: z.string().optional(),
});

/**
 * 입력값 검증 함수 (제네릭)
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new Error(firstError?.message || '입력값 검증 실패');
    }
    throw error;
  }
}

/**
 * 날짜 범위 검증
 */
export function validateDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
}

/**
 * 날짜 형식 변환 (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 시간 형식 변환 (HH:MM)
 */
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}


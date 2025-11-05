/**
 * Level 1: 경기일정 서비스 (비즈니스 로직 단위)
 * Mock 기반 구현 - 데이터 파싱 및 변환 로직만 구현
 */

import type { Schedule } from '@shared/types';
import { formatDate, parseDate, combineDateTime } from '../utils/dateFormatter';
import { validateInput, scheduleDataSchema } from '../utils/validator';

/**
 * 경기일정 데이터 검증 및 정규화
 * @param data 원본 경기일정 데이터
 * @returns 검증 및 정규화된 경기일정 데이터
 */
export function validateAndNormalizeSchedule(data: unknown): Schedule {
  const validated = validateInput(scheduleDataSchema, data) as Partial<Schedule>;

  // 필수 필드 확인
  if (!validated.team_id || !validated.game_date || !validated.opponent_team) {
    throw new Error('필수 필드가 누락되었습니다 (team_id, game_date, opponent_team)');
  }

  // 날짜 형식 확인
  try {
    parseDate(validated.game_date);
  } catch (error) {
    throw new Error(`유효하지 않은 날짜 형식: ${validated.game_date}`);
  }

  // 시간 형식 확인 (있는 경우)
  if (validated.game_time) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(validated.game_time)) {
      throw new Error(`유효하지 않은 시간 형식: ${validated.game_time}`);
    }
  }

  // 기본값 설정
  return {
    schedule_id: 0, // 실제 DB에서는 자동 생성
    team_id: validated.team_id,
    game_date: validated.game_date,
    game_time: validated.game_time || undefined,
    opponent_team: validated.opponent_team,
    venue_type: validated.venue_type || 'HOME', // 기본값 설정
    venue_name: validated.venue_name || undefined,
    game_status: validated.game_status || 'SCHEDULED',
    game_result: validated.game_result || undefined,
    score: validated.score || undefined,
    crawled_at: new Date().toISOString(),
    updated_at: undefined,
  };
}

/**
 * 경기일정 중복 체크 (같은 팀, 같은 날짜, 같은 시간, 같은 상대팀)
 * @param schedules 기존 경기일정 목록
 * @param newSchedule 새로운 경기일정
 * @returns 중복 여부
 */
export function isDuplicateSchedule(
  schedules: Schedule[],
  newSchedule: Schedule
): boolean {
  return schedules.some((schedule) => {
    return (
      schedule.team_id === newSchedule.team_id &&
      schedule.game_date === newSchedule.game_date &&
      schedule.game_time === newSchedule.game_time &&
      schedule.opponent_team === newSchedule.opponent_team
    );
  });
}

/**
 * 경기일정 목록을 날짜별로 그룹화
 * @param schedules 경기일정 목록
 * @returns 날짜별로 그룹화된 경기일정
 */
export function groupSchedulesByDate(schedules: Schedule[]): Record<string, Schedule[]> {
  return schedules.reduce((acc, schedule) => {
    const date = schedule.game_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);
}

/**
 * 경기일정 목록 필터링 (날짜 범위)
 * @param schedules 경기일정 목록
 * @param startDate 시작 날짜 (YYYY-MM-DD)
 * @param endDate 종료 날짜 (YYYY-MM-DD)
 * @returns 필터링된 경기일정 목록
 */
export function filterSchedulesByDateRange(
  schedules: Schedule[],
  startDate: string,
  endDate: string
): Schedule[] {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (start > end) {
    throw new Error('시작 날짜는 종료 날짜보다 이전이어야 합니다');
  }

  return schedules.filter((schedule) => {
    const scheduleDate = parseDate(schedule.game_date);
    return scheduleDate >= start && scheduleDate <= end;
  });
}

/**
 * 경기일정 목록 필터링 (팀 ID)
 * @param schedules 경기일정 목록
 * @param teamId 팀 ID
 * @returns 필터링된 경기일정 목록
 */
export function filterSchedulesByTeam(
  schedules: Schedule[],
  teamId: number
): Schedule[] {
  return schedules.filter((schedule) => schedule.team_id === teamId);
}

/**
 * 경기일정 정렬 (날짜, 시간 순)
 * @param schedules 경기일정 목록
 * @returns 정렬된 경기일정 목록
 */
export function sortSchedulesByDateTime(schedules: Schedule[]): Schedule[] {
  return [...schedules].sort((a, b) => {
    // 날짜 비교
    const dateA = parseDate(a.game_date);
    const dateB = parseDate(b.game_date);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }

    // 날짜가 같으면 시간 비교
    const timeA = a.game_time || '00:00';
    const timeB = b.game_time || '00:00';
    return timeA.localeCompare(timeB);
  });
}

/**
 * 경기일정 데이터 변환 (크롤링 데이터 → Schedule 형식)
 * @param rawData 크롤링으로 얻은 원본 데이터
 * @param teamId 팀 ID
 * @returns 변환된 경기일정 데이터
 */
export function transformCrawledData(
  rawData: {
    date: string;
    time?: string;
    opponent: string;
    venue?: string;
    venueType?: 'HOME' | 'AWAY';
  },
  teamId: number
): Partial<Schedule> {
  return {
    team_id: teamId,
    game_date: rawData.date,
    game_time: rawData.time,
    opponent_team: rawData.opponent,
    venue_name: rawData.venue,
    venue_type: rawData.venueType || 'HOME',
    game_status: 'SCHEDULED',
  };
}


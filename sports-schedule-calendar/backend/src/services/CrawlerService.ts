/**
 * Level 1: 크롤링 서비스 (비즈니스 로직 단위)
 * Mock 기반 구현 - HTML 파싱 및 데이터 추출 로직만 구현
 */

import type { Schedule, CrawlHistory } from '@shared/types';
import { transformCrawledData, validateAndNormalizeSchedule } from './ScheduleService';

/**
 * HTML에서 경기일정 데이터 추출 (Mock 구현)
 * 실제로는 Cheerio나 Puppeteer를 사용
 * @param html HTML 문자열
 * @param teamId 팀 ID
 * @returns 추출된 경기일정 데이터
 */
export function parseScheduleFromHTML(html: string, teamId: number): Partial<Schedule>[] {
  // Mock: 실제로는 HTML 파싱 로직
  if (!html || html.length < 10) {
    throw new Error('유효하지 않은 HTML 데이터입니다');
  }

  // Mock 데이터 반환
  const mockSchedules: Partial<Schedule>[] = [
    {
      team_id: teamId,
      game_date: '2025-11-10',
      game_time: '18:00',
      opponent_team: 'Mock Team A',
      venue_type: 'HOME',
      venue_name: 'Mock Stadium',
      game_status: 'SCHEDULED',
    },
    {
      team_id: teamId,
      game_date: '2025-11-15',
      game_time: '19:00',
      opponent_team: 'Mock Team B',
      venue_type: 'AWAY',
      venue_name: 'Away Stadium',
      game_status: 'SCHEDULED',
    },
  ];

  return mockSchedules;
}

/**
 * HTML에서 날짜 추출 (Mock 구현)
 * @param html HTML 문자열
 * @returns 날짜 문자열 (YYYY-MM-DD)
 */
export function extractDateFromHTML(html: string): string[] {
  // Mock: 실제로는 정규식이나 파서를 사용하여 날짜 추출
  const dateRegex = /\d{4}-\d{2}-\d{2}/g;
  const matches = html.match(dateRegex);
  return matches || [];
}

/**
 * HTML에서 시간 추출 (Mock 구현)
 * @param html HTML 문자열
 * @returns 시간 문자열 (HH:MM)
 */
export function extractTimeFromHTML(html: string): string[] {
  // Mock: 실제로는 정규식이나 파서를 사용하여 시간 추출
  const timeRegex = /([01]\d|2[0-3]):([0-5]\d)/g;
  const matches = html.match(timeRegex);
  return matches || [];
}

/**
 * 크롤링 데이터를 Schedule 형식으로 변환
 * @param crawledData 크롤링으로 얻은 원본 데이터 배열
 * @param teamId 팀 ID
 * @returns 변환된 Schedule 배열
 */
export function transformCrawledSchedules(
  crawledData: Array<{
    date: string;
    time?: string;
    opponent: string;
    venue?: string;
    venueType?: 'HOME' | 'AWAY';
  }>,
  teamId: number
): Schedule[] {
  return crawledData
    .map((data) => {
      try {
        const transformed = transformCrawledData(data, teamId);
        return validateAndNormalizeSchedule(transformed);
      } catch (error) {
        console.warn(`경기일정 변환 실패: ${error instanceof Error ? error.message : String(error)}`);
        return null;
      }
    })
    .filter((schedule): schedule is Schedule => schedule !== null);
}

/**
 * 크롤링 이력 생성 (Mock 구현)
 * @param teamId 팀 ID
 * @param status 크롤링 상태
 * @param schedulesFound 발견된 경기일정 수
 * @param schedulesSaved 저장된 경기일정 수
 * @param errorMessage 에러 메시지 (선택)
 * @returns 크롤링 이력
 */
export function createCrawlHistory(
  teamId: number,
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS',
  schedulesFound: number = 0,
  schedulesSaved: number = 0,
  errorMessage?: string
): CrawlHistory {
  const now = new Date().toISOString();
  return {
    crawl_id: 0, // 실제 DB에서는 자동 생성
    team_id: teamId,
    started_at: now,
    finished_at: status !== 'IN_PROGRESS' ? now : undefined,
    status: status,
    schedules_found: schedulesFound,
    schedules_saved: schedulesSaved,
    error_message: errorMessage,
  };
}

/**
 * 크롤링 URL 유효성 검증
 * @param url 크롤링 대상 URL
 * @returns 유효성 여부
 */
export function validateCrawlUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 크롤링 설정 파싱 (JSON 문자열)
 * @param configJson 설정 JSON 문자열
 * @returns 파싱된 설정 객체
 */
export function parseCrawlConfig(configJson: string | null | undefined): Record<string, unknown> {
  if (!configJson) {
    return {};
  }

  try {
    return JSON.parse(configJson);
  } catch (error) {
    console.warn(`크롤링 설정 파싱 실패: ${error instanceof Error ? error.message : String(error)}`);
    return {};
  }
}


/**
 * Level 1: 경기일정 서비스 테스트
 */

import {
  validateAndNormalizeSchedule,
  isDuplicateSchedule,
  groupSchedulesByDate,
  filterSchedulesByDateRange,
  filterSchedulesByTeam,
  sortSchedulesByDateTime,
} from '../ScheduleService';
import type { Schedule } from '@shared/types';

describe('ScheduleService', () => {
  const mockSchedule: Partial<Schedule> = {
    team_id: 1,
    game_date: '2025-11-10',
    game_time: '18:00',
    opponent_team: 'Team A',
    venue_type: 'HOME',
    venue_name: 'Stadium A',
    game_status: 'SCHEDULED',
  };

  describe('validateAndNormalizeSchedule', () => {
    it('유효한 경기일정 데이터를 검증하고 정규화할 수 있어야 함', () => {
      const result = validateAndNormalizeSchedule(mockSchedule);

      expect(result.team_id).toBe(mockSchedule.team_id);
      expect(result.game_date).toBe(mockSchedule.game_date);
      expect(result.game_time).toBe(mockSchedule.game_time);
      expect(result.opponent_team).toBe(mockSchedule.opponent_team);
      expect(result.venue_type).toBe(mockSchedule.venue_type);
      expect(result.game_status).toBe('SCHEDULED');
    });

    it('필수 필드가 없으면 에러를 발생시켜야 함', () => {
      const invalidSchedule = {
        team_id: 1,
        // game_date 누락
        opponent_team: 'Team A',
      };

      expect(() => {
        validateAndNormalizeSchedule(invalidSchedule);
      }).toThrow();
    });

    it('잘못된 날짜 형식은 에러를 발생시켜야 함', () => {
      const invalidSchedule = {
        ...mockSchedule,
        game_date: 'invalid-date',
      };

      expect(() => {
        validateAndNormalizeSchedule(invalidSchedule);
      }).toThrow();
    });

    it('기본값을 설정해야 함', () => {
      const scheduleWithoutDefaults = {
        team_id: 1,
        game_date: '2025-11-10',
        opponent_team: 'Team A',
        venue_type: 'HOME' as const,
      };

      const result = validateAndNormalizeSchedule(scheduleWithoutDefaults);

      expect(result.game_status).toBe('SCHEDULED');
      expect(result.schedule_id).toBe(0);
    });
  });

  describe('isDuplicateSchedule', () => {
    it('중복된 경기일정을 감지할 수 있어야 함', () => {
      const schedules: Schedule[] = [
        {
          schedule_id: 1,
          team_id: 1,
          game_date: '2025-11-10',
          game_time: '18:00',
          opponent_team: 'Team A',
          venue_type: 'HOME',
          game_status: 'SCHEDULED',
          crawled_at: new Date().toISOString(),
        },
      ];

      const newSchedule: Schedule = {
        schedule_id: 2,
        team_id: 1,
        game_date: '2025-11-10',
        game_time: '18:00',
        opponent_team: 'Team A',
        venue_type: 'HOME',
        game_status: 'SCHEDULED',
        crawled_at: new Date().toISOString(),
      };

      expect(isDuplicateSchedule(schedules, newSchedule)).toBe(true);
    });

    it('중복되지 않은 경기일정은 false를 반환해야 함', () => {
      const schedules: Schedule[] = [
        {
          schedule_id: 1,
          team_id: 1,
          game_date: '2025-11-10',
          game_time: '18:00',
          opponent_team: 'Team A',
          venue_type: 'HOME',
          game_status: 'SCHEDULED',
          crawled_at: new Date().toISOString(),
        },
      ];

      const newSchedule: Schedule = {
        schedule_id: 2,
        team_id: 1,
        game_date: '2025-11-11', // 다른 날짜
        game_time: '18:00',
        opponent_team: 'Team A',
        venue_type: 'HOME',
        game_status: 'SCHEDULED',
        crawled_at: new Date().toISOString(),
      };

      expect(isDuplicateSchedule(schedules, newSchedule)).toBe(false);
    });
  });

  describe('groupSchedulesByDate', () => {
    it('경기일정을 날짜별로 그룹화할 수 있어야 함', () => {
      const schedules: Schedule[] = [
        {
          schedule_id: 1,
          team_id: 1,
          game_date: '2025-11-10',
          game_time: '18:00',
          opponent_team: 'Team A',
          venue_type: 'HOME',
          game_status: 'SCHEDULED',
          crawled_at: new Date().toISOString(),
        },
        {
          schedule_id: 2,
          team_id: 1,
          game_date: '2025-11-10',
          game_time: '19:00',
          opponent_team: 'Team B',
          venue_type: 'AWAY',
          game_status: 'SCHEDULED',
          crawled_at: new Date().toISOString(),
        },
        {
          schedule_id: 3,
          team_id: 1,
          game_date: '2025-11-11',
          game_time: '18:00',
          opponent_team: 'Team C',
          venue_type: 'HOME',
          game_status: 'SCHEDULED',
          crawled_at: new Date().toISOString(),
        },
      ];

      const grouped = groupSchedulesByDate(schedules);

      expect(grouped['2025-11-10']).toHaveLength(2);
      expect(grouped['2025-11-11']).toHaveLength(1);
    });
  });

  describe('filterSchedulesByDateRange', () => {
    it('날짜 범위로 경기일정을 필터링할 수 있어야 함', () => {
      const schedules: Schedule[] = [
        {
          schedule_id: 1,
          team_id: 1,
          game_date: '2025-11-10',
          game_time: '18:00',
          opponent_team: 'Team A',
          venue_type: 'HOME',
          game_status: 'SCHEDULED',
          crawled_at: new Date().toISOString(),
        },
        {
          schedule_id: 2,
          team_id: 1,
          game_date: '2025-11-15',
          game_time: '18:00',
          opponent_team: 'Team B',
          venue_type: 'HOME',
          game_status: 'SCHEDULED',
          crawled_at: new Date().toISOString(),
        },
        {
          schedule_id: 3,
          team_id: 1,
          game_date: '2025-11-20',
          game_time: '18:00',
          opponent_team: 'Team C',
          venue_type: 'HOME',
          game_status: 'SCHEDULED',
          crawled_at: new Date().toISOString(),
        },
      ];

      const filtered = filterSchedulesByDateRange(schedules, '2025-11-10', '2025-11-15');

      expect(filtered).toHaveLength(2);
      expect(filtered[0].game_date).toBe('2025-11-10');
      expect(filtered[1].game_date).toBe('2025-11-15');
    });

    it('시작 날짜가 종료 날짜보다 늦으면 에러를 발생시켜야 함', () => {
      const schedules: Schedule[] = [];

      expect(() => {
        filterSchedulesByDateRange(schedules, '2025-11-15', '2025-11-10');
      }).toThrow();
    });
  });

  describe('filterSchedulesByTeam', () => {
    it('팀 ID로 경기일정을 필터링할 수 있어야 함', () => {
      const schedules: Schedule[] = [
        {
          schedule_id: 1,
          team_id: 1,
          game_date: '2025-11-10',
          game_time: '18:00',
          opponent_team: 'Team A',
          venue_type: 'HOME',
          game_status: 'SCHEDULED',
          crawled_at: new Date().toISOString(),
        },
        {
          schedule_id: 2,
          team_id: 2,
          game_date: '2025-11-10',
          game_time: '18:00',
          opponent_team: 'Team B',
          venue_type: 'HOME',
          game_status: 'SCHEDULED',
          crawled_at: new Date().toISOString(),
        },
      ];

      const filtered = filterSchedulesByTeam(schedules, 1);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].team_id).toBe(1);
    });
  });

  describe('sortSchedulesByDateTime', () => {
    it('경기일정을 날짜와 시간 순으로 정렬할 수 있어야 함', () => {
      const schedules: Schedule[] = [
        {
          schedule_id: 1,
          team_id: 1,
          game_date: '2025-11-10',
          game_time: '19:00',
          opponent_team: 'Team A',
          venue_type: 'HOME',
          game_status: 'SCHEDULED',
          crawled_at: new Date().toISOString(),
        },
        {
          schedule_id: 2,
          team_id: 1,
          game_date: '2025-11-10',
          game_time: '18:00',
          opponent_team: 'Team B',
          venue_type: 'HOME',
          game_status: 'SCHEDULED',
          crawled_at: new Date().toISOString(),
        },
        {
          schedule_id: 3,
          team_id: 1,
          game_date: '2025-11-09',
          game_time: '18:00',
          opponent_team: 'Team C',
          venue_type: 'HOME',
          game_status: 'SCHEDULED',
          crawled_at: new Date().toISOString(),
        },
      ];

      const sorted = sortSchedulesByDateTime(schedules);

      expect(sorted[0].game_date).toBe('2025-11-09');
      expect(sorted[1].game_time).toBe('18:00');
      expect(sorted[2].game_time).toBe('19:00');
    });
  });
});


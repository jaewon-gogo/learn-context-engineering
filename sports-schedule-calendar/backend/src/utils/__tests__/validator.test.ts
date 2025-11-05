/**
 * Level 1: 입력값 검증 유틸리티 테스트
 */

import { validateInput, validateDateRange, formatDate, formatTime, emailSchema, dateSchema, scheduleQuerySchema } from '../validator';

describe('validator', () => {
  describe('emailSchema', () => {
    it('유효한 이메일을 검증할 수 있어야 함', () => {
      const result = validateInput(emailSchema, 'test@example.com');
      expect(result).toBe('test@example.com');
    });

    it('유효하지 않은 이메일은 에러를 발생시켜야 함', () => {
      expect(() => {
        validateInput(emailSchema, 'invalid-email');
      }).toThrow();
    });
  });

  describe('dateSchema', () => {
    it('유효한 날짜 형식을 검증할 수 있어야 함', () => {
      const result = validateInput(dateSchema, '2025-11-10');
      expect(result).toBe('2025-11-10');
    });

    it('유효하지 않은 날짜 형식은 에러를 발생시켜야 함', () => {
      expect(() => {
        validateInput(dateSchema, '2025/11/10');
      }).toThrow();
    });
  });

  describe('scheduleQuerySchema', () => {
    it('유효한 쿼리 파라미터를 검증할 수 있어야 함', () => {
      const query = {
        team_id: 1,
        start_date: '2025-11-01',
        end_date: '2025-11-30',
      };

      const result = validateInput(scheduleQuerySchema, query);
      expect(result).toEqual(query);
    });

    it('선택적 파라미터는 생략 가능해야 함', () => {
      const query = {};

      const result = validateInput(scheduleQuerySchema, query);
      expect(result).toEqual(query);
    });
  });

  describe('validateDateRange', () => {
    it('유효한 날짜 범위를 검증할 수 있어야 함', () => {
      expect(validateDateRange('2025-11-01', '2025-11-30')).toBe(true);
    });

    it('시작 날짜가 종료 날짜보다 늦으면 false를 반환해야 함', () => {
      expect(validateDateRange('2025-11-30', '2025-11-01')).toBe(false);
    });

    it('같은 날짜는 유효해야 함', () => {
      expect(validateDateRange('2025-11-01', '2025-11-01')).toBe(true);
    });
  });

  describe('formatDate', () => {
    it('Date 객체를 YYYY-MM-DD 형식으로 변환할 수 있어야 함', () => {
      const date = new Date(2025, 10, 5); // 2025-11-05
      const formatted = formatDate(date);
      expect(formatted).toBe('2025-11-05');
    });
  });

  describe('formatTime', () => {
    it('Date 객체를 HH:MM 형식으로 변환할 수 있어야 함', () => {
      const date = new Date(2025, 10, 5, 18, 30);
      const formatted = formatTime(date);
      expect(formatted).toBe('18:30');
    });
  });
});


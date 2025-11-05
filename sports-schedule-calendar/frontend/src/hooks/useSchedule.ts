/**
 * Level 2: 경기일정 관련 커스텀 훅 (실제 API 연동)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Schedule } from '@/types';
import { apiGet } from '@/lib/api';

interface UseScheduleProps {
  teamId?: number;
  startDate?: string;
  endDate?: string;
}

interface UseScheduleReturn {
  schedules: Schedule[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

/**
 * 경기일정 조회 훅 (실제 API 연동)
 */
export function useSchedule({
  teamId,
  startDate,
  endDate,
}: UseScheduleProps = {}): UseScheduleReturn {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSchedules = useCallback(async () => {
    if (!teamId) {
      setSchedules([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 실제 API 호출
      const params = new URLSearchParams();
      params.append('team_id', teamId.toString());
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const data = await apiGet<{ schedules: Schedule[] }>(`/api/v1/schedules?${params.toString()}`);
      setSchedules(data.schedules || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('경기일정 조회 실패');
      setError(error);
      console.error('경기일정 조회 오류:', error);
      // 에러 발생 시 빈 배열 반환
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  }, [teamId, startDate, endDate]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return {
    schedules,
    isLoading,
    error,
    refresh: fetchSchedules,
  };
}


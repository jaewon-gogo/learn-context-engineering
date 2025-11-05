/**
 * Level 2: 캘린더 동기화 관련 커스텀 훅 (실제 API 연동)
 */

'use client';

import { useState, useCallback } from 'react';
import type { GoogleCalendar, SyncResult } from '@/types';
import { apiGet, apiPost } from '@/lib/api';

interface UseCalendarReturn {
  calendars: GoogleCalendar[];
  isLoading: boolean;
  error: Error | null;
  syncSchedules: (calendarId: string, scheduleIds: number[]) => Promise<SyncResult>;
  loadCalendars: () => Promise<void>;
}

/**
 * 캘린더 동기화 훅 (실제 API 연동)
 */
export function useCalendar(): UseCalendarReturn {
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Google 캘린더 목록 조회
   */
  const loadCalendars = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Level 2: 실제 API 호출
      const data = await apiGet<{ calendars: GoogleCalendar[] }>('/api/v1/calendar/list');
      setCalendars(data.calendars || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('캘린더 목록 조회 실패');
      setError(error);
      console.error('캘린더 목록 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 경기일정 동기화
   */
  const syncSchedules = useCallback(
    async (calendarId: string, scheduleIds: number[]): Promise<SyncResult> => {
      setIsLoading(true);
      setError(null);

      try {
        // Level 2: 실제 API 호출
        const data = await apiPost<SyncResult>('/api/v1/calendar/sync', {
          calendar_id: calendarId,
          schedule_ids: scheduleIds,
        });

        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('동기화 실패');
        setError(error);
        console.error('캘린더 동기화 오류:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    calendars,
    isLoading,
    error,
    syncSchedules,
    loadCalendars,
  };
}


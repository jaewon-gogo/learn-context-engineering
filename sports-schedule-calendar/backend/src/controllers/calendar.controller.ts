/**
 * Level 2: 캘린더 컨트롤러
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { get, all, run } from '../database/db';
import type { GoogleCalendar, SyncResult, CalendarSettings } from '@shared/types';

export class CalendarController {
  /**
   * Google 캘린더 목록 조회
   */
  async listCalendars(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
            details: {},
          },
        });
        return;
      }

      // Mock: 실제로는 Google Calendar API 호출
      const mockCalendars: GoogleCalendar[] = [
        {
          id: 'primary',
          summary: '내 캘린더',
          description: '기본 캘린더',
          backgroundColor: '#4285F4',
          foregroundColor: '#FFFFFF',
          accessRole: 'owner',
        },
      ];

      res.json({
        success: true,
        data: { calendars: mockCalendars },
      });
    } catch (error) {
      logger.error('캘린더 목록 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CALENDAR_LIST_ERROR',
          message: '캘린더 목록 조회 중 오류가 발생했습니다',
          details: {},
        },
      });
    }
  }

  /**
   * 경기일정 캘린더 동기화
   */
  async syncSchedules(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.user_id;
      const { calendar_id, schedule_ids } = req.body;

      if (!userId || !calendar_id || !Array.isArray(schedule_ids)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'calendar_id와 schedule_ids가 필요합니다',
            details: {},
          },
        });
        return;
      }

      // Mock: 실제로는 Google Calendar API를 호출하여 이벤트 생성
      logger.info(`캘린더 동기화 시작: user_id=${userId}, calendar_id=${calendar_id}, schedule_ids=${schedule_ids.length}`);

      const syncResults: SyncResult = {
        success: true,
        synced_count: schedule_ids.length,
        failed_count: 0,
        errors: [],
      };

      // 각 경기일정에 대해 동기화 이력 저장
      for (const scheduleId of schedule_ids) {
        await run(
          `INSERT INTO calendar_sync_history 
           (user_id, schedule_id, google_event_id, sync_status)
           VALUES (?, ?, ?, 'SUCCESS')`,
          [userId, scheduleId, `event_${scheduleId}_${Date.now()}`]
        );
      }

      res.json({
        success: true,
        message: '캘린더 동기화가 완료되었습니다',
        data: syncResults,
      });
    } catch (error) {
      logger.error('캘린더 동기화 실패:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SYNC_ERROR',
          message: '캘린더 동기화 중 오류가 발생했습니다',
          details: {},
        },
      });
    }
  }

  /**
   * 캘린더 연동 상태 조회
   */
  async getSyncStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
            details: {},
          },
        });
        return;
      }

      const settings = await get<CalendarSettings>(
        'SELECT * FROM calendar_settings WHERE user_id = ?',
        [userId]
      );

      const syncHistory = await all(
        `SELECT COUNT(*) as total, 
                SUM(CASE WHEN sync_status = 'SUCCESS' THEN 1 ELSE 0 END) as success_count,
                SUM(CASE WHEN sync_status = 'FAILED' THEN 1 ELSE 0 END) as failed_count
         FROM calendar_sync_history
         WHERE user_id = ?`,
        [userId]
      );

      res.json({
        success: true,
        data: {
          settings: settings || null,
          statistics: syncHistory[0] || { total: 0, success_count: 0, failed_count: 0 },
        },
      });
    } catch (error) {
      logger.error('캘린더 상태 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'STATUS_ERROR',
          message: '캘린더 상태 조회 중 오류가 발생했습니다',
          details: {},
        },
      });
    }
  }

  /**
   * 캘린더 설정 수정
   */
  async updateSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.user_id;
      const {
        google_calendar_id,
        calendar_name,
        auto_sync,
        sync_interval,
        email_notification,
        push_notification,
        notification_timing,
        calendar_color,
      } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
            details: {},
          },
        });
        return;
      }

      // 기존 설정 확인
      const existing = await get<CalendarSettings>(
        'SELECT * FROM calendar_settings WHERE user_id = ?',
        [userId]
      );

      if (existing) {
        // 업데이트
        await run(
          `UPDATE calendar_settings SET
           google_calendar_id = ?,
           calendar_name = ?,
           auto_sync = ?,
           sync_interval = ?,
           email_notification = ?,
           push_notification = ?,
           notification_timing = ?,
           calendar_color = ?,
           updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ?`,
          [
            google_calendar_id || existing.google_calendar_id,
            calendar_name || existing.calendar_name,
            auto_sync !== undefined ? auto_sync : existing.auto_sync,
            sync_interval || existing.sync_interval,
            email_notification !== undefined ? email_notification : existing.email_notification,
            push_notification !== undefined ? push_notification : existing.push_notification,
            notification_timing || existing.notification_timing,
            calendar_color || existing.calendar_color,
            userId,
          ]
        );
      } else {
        // 생성
        await run(
          `INSERT INTO calendar_settings 
           (user_id, google_calendar_id, calendar_name, auto_sync, sync_interval, 
            email_notification, push_notification, notification_timing, calendar_color)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            google_calendar_id || 'primary',
            calendar_name || '스포츠 경기일정',
            auto_sync !== undefined ? auto_sync : true,
            sync_interval || 'DAILY',
            email_notification !== undefined ? email_notification : true,
            push_notification !== undefined ? push_notification : true,
            notification_timing || '1일전,1시간전',
            calendar_color,
          ]
        );
      }

      const updated = await get<CalendarSettings>(
        'SELECT * FROM calendar_settings WHERE user_id = ?',
        [userId]
      );

      res.json({
        success: true,
        message: '캘린더 설정이 저장되었습니다',
        data: updated,
      });
    } catch (error) {
      logger.error('캘린더 설정 수정 실패:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SETTINGS_ERROR',
          message: '캘린더 설정 수정 중 오류가 발생했습니다',
          details: {},
        },
      });
    }
  }
}


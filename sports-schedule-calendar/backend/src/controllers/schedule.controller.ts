/**
 * Level 2: 경기일정 컨트롤러
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { all, run } from '../database/db';
import type { Schedule } from '@shared/types';
import {
  filterSchedulesByDateRange,
  filterSchedulesByTeam,
  sortSchedulesByDateTime,
} from '../services/ScheduleService';

export class ScheduleController {
  /**
   * 경기일정 조회
   */
  async getSchedules(req: Request, res: Response): Promise<void> {
    try {
      const { team_id, start_date, end_date } = req.query;

      let sql = `
        SELECT s.*, t.team_name
        FROM schedules s
        JOIN teams t ON s.team_id = t.team_id
        WHERE 1=1
      `;
      const params: unknown[] = [];

      if (team_id) {
        sql += ' AND s.team_id = ?';
        params.push(Number(team_id));
      }

      if (start_date) {
        sql += ' AND s.game_date >= ?';
        params.push(start_date);
      }

      if (end_date) {
        sql += ' AND s.game_date <= ?';
        params.push(end_date);
      }

      sql += ' ORDER BY s.game_date, s.game_time';

      const schedules = await all<Schedule>(sql, params);

      res.json({
        success: true,
        data: { schedules },
      });
    } catch (error) {
      logger.error('경기일정 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SCHEDULES_ERROR',
          message: '경기일정 조회 중 오류가 발생했습니다',
          details: {},
        },
      });
    }
  }

  /**
   * 크롤링 실행
   */
  async crawlSchedules(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { team_id } = req.body;

      if (!team_id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'team_id가 필요합니다',
            details: {},
          },
        });
        return;
      }

      // Mock: 실제로는 크롤링 로직 실행
      logger.info(`크롤링 시작: team_id=${team_id}`);

      // 크롤링 이력 생성
      const crawlResult = await run(
        `INSERT INTO crawl_history (team_id, crawl_status, schedules_found, schedules_saved)
         VALUES (?, 'IN_PROGRESS', 0, 0)`,
        [team_id]
      );

      // Mock: 크롤링 완료 처리
      await run(
        `UPDATE crawl_history 
         SET crawl_status = 'SUCCESS', 
             crawl_finished_at = CURRENT_TIMESTAMP,
             schedules_found = 0,
             schedules_saved = 0
         WHERE crawl_id = ?`,
        [crawlResult.lastID]
      );

      res.json({
        success: true,
        message: '크롤링이 완료되었습니다',
        data: {
          crawl_id: crawlResult.lastID,
          team_id: Number(team_id),
        },
      });
    } catch (error) {
      logger.error('크롤링 실패:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CRAWL_ERROR',
          message: '크롤링 중 오류가 발생했습니다',
          details: {},
        },
      });
    }
  }
}


/**
 * Level 2: 팀 컨트롤러
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { all } from '../database/db';
import type { Sport, Team } from '@shared/types';

export class TeamController {
  /**
   * 스포츠 종목 목록 조회
   */
  async getSports(req: Request, res: Response): Promise<void> {
    try {
      const sports = await all<Sport>(
        'SELECT * FROM sports WHERE is_active = 1 ORDER BY display_order, sports_name'
      );

      res.json({
        success: true,
        data: { sports },
      });
    } catch (error) {
      logger.error('스포츠 목록 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SPORTS_ERROR',
          message: '스포츠 목록 조회 중 오류가 발생했습니다',
          details: {},
        },
      });
    }
  }

  /**
   * 팀 목록 조회
   */
  async getTeams(req: Request, res: Response): Promise<void> {
    try {
      const { sports_id } = req.query;

      let sql = 'SELECT * FROM teams WHERE is_active = 1';
      const params: unknown[] = [];

      if (sports_id) {
        sql += ' AND sports_id = ?';
        params.push(Number(sports_id));
      }

      sql += ' ORDER BY team_name';

      const teams = await all<Team>(sql, params);

      res.json({
        success: true,
        data: { teams },
      });
    } catch (error) {
      logger.error('팀 목록 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TEAMS_ERROR',
          message: '팀 목록 조회 중 오류가 발생했습니다',
          details: {},
        },
      });
    }
  }
}


/**
 * Level 2: 인증 미들웨어
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    user_id: number;
    email: string;
    google_user_id: string;
  };
}

/**
 * JWT 토큰 검증 미들웨어
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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

    const token = authHeader.substring(7); // 'Bearer ' 제거
    const payload = verifyToken(token);

    req.user = {
      user_id: payload.user_id,
      email: payload.email,
      google_user_id: payload.google_user_id,
    };

    next();
  } catch (error) {
    logger.warn('인증 실패:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: error instanceof Error ? error.message : '유효하지 않은 토큰입니다',
        details: {},
      },
    });
  }
}


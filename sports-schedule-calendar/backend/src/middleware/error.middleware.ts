/**
 * Level 2: 에러 핸들링 미들웨어
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('에러 발생:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // 기본 에러 응답
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production'
    ? '서버 오류가 발생했습니다'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message,
      details: process.env.NODE_ENV === 'development' ? { stack: err.stack } : {},
    },
  });
}


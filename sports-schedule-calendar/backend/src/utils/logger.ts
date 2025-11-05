/**
 * Level 1: 로깅 유틸리티
 * Winston 기반 로거 설정
 */

import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';

/**
 * Winston 로거 인스턴스 생성
 */
export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'sports-schedule-calendar' },
  transports: [
    // 콘솔 출력
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      ),
    }),
    // 에러 로그 파일
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // 전체 로그 파일
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

/**
 * 로그 디렉토리 생성 (초기화 시)
 */
export function initializeLogger(): void {
  // 로그 디렉토리가 없으면 생성 (실제로는 fs 모듈 사용)
  // Level 1에서는 Mock로 구현
  logger.info('로거 초기화 완료');
}

// 개발 환경에서는 더 자세한 로그 출력
if (process.env.NODE_ENV !== 'production') {
  logger.debug('개발 모드: 상세 로그 활성화');
}


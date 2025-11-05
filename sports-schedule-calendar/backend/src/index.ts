/**
 * Level 2: Express 서버 진입점
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger, initializeLogger } from './utils/logger';
import { runMigrations } from './database/migrations';
import { seedDatabase } from './database/seeds';
import authRoutes from './routes/auth.routes';
import scheduleRoutes from './routes/schedule.routes';
import teamRoutes from './routes/team.routes';
import calendarRoutes from './routes/calendar.routes';
import { errorHandler } from './middleware/error.middleware';

// 환경 변수 로드
dotenv.config();

// 로거 초기화
initializeLogger();

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 라우트
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/calendar', calendarRoutes);

// 에러 핸들링 미들웨어
app.use(errorHandler);

// 서버 시작
async function startServer() {
  try {
    // 데이터베이스 마이그레이션 실행
    await runMigrations();
    
    // 초기 데이터 삽입
    await seedDatabase();

    // 서버 시작
    app.listen(PORT, () => {
      logger.info(`서버 시작: http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('서버 시작 실패:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM 신호 수신, 서버 종료 중...');
  const { close } = await import('./database/db');
  await close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT 신호 수신, 서버 종료 중...');
  const { close } = await import('./database/db');
  await close();
  process.exit(0);
});


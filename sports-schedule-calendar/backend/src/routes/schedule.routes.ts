/**
 * Level 2: 경기일정 라우트
 */

import { Router } from 'express';
import { ScheduleController } from '../controllers/schedule.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const scheduleController = new ScheduleController();

// 경기일정 조회
router.get('/', authMiddleware, scheduleController.getSchedules.bind(scheduleController));

// 크롤링 실행
router.post('/crawl', authMiddleware, scheduleController.crawlSchedules.bind(scheduleController));

export default router;


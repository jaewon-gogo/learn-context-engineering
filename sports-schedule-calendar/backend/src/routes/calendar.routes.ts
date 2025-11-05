/**
 * Level 2: 캘린더 라우트
 */

import { Router } from 'express';
import { CalendarController } from '../controllers/calendar.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const calendarController = new CalendarController();

// Google 캘린더 목록 조회
router.get('/list', authMiddleware, calendarController.listCalendars.bind(calendarController));

// 캘린더 동기화
router.post('/sync', authMiddleware, calendarController.syncSchedules.bind(calendarController));

// 캘린더 연동 상태 조회
router.get('/status', authMiddleware, calendarController.getSyncStatus.bind(calendarController));

// 캘린더 설정 수정
router.put('/settings', authMiddleware, calendarController.updateSettings.bind(calendarController));

export default router;


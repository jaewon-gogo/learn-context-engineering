/**
 * Level 2: 팀 라우트
 */

import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const teamController = new TeamController();

// 스포츠 목록 조회
router.get('/sports', authMiddleware, teamController.getSports.bind(teamController));

// 팀 목록 조회
router.get('/', authMiddleware, teamController.getTeams.bind(teamController));

export default router;


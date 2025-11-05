/**
 * Level 2: 인증 라우트
 */

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Google OAuth 로그인 시작
router.get('/google', authController.initiateGoogleLogin.bind(authController));

// Google OAuth 콜백
router.get('/google/callback', authController.handleGoogleCallback.bind(authController));

// 로그아웃
router.post('/logout', authMiddleware, authController.logout.bind(authController));

// 현재 사용자 정보 조회
router.get('/me', authMiddleware, authController.getCurrentUser.bind(authController));

export default router;


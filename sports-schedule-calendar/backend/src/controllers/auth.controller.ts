/**
 * Level 2: 인증 컨트롤러
 */

import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { run, get } from '../database/db';
import type { User } from '@shared/types';

export class AuthController {
  /**
   * Google OAuth 로그인 시작
   */
  async initiateGoogleLogin(req: Request, res: Response): Promise<void> {
    try {
      const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/google/callback`;
      const authUrl = await AuthService.initiateGoogleLogin(redirectUri);
      res.redirect(authUrl);
    } catch (error) {
      logger.error('OAuth 시작 실패:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'OAUTH_ERROR',
          message: 'OAuth 설정 오류가 발생했습니다',
          details: {},
        },
      });
    }
  }

  /**
   * Google OAuth 콜백 처리
   */
  async handleGoogleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CODE',
            message: '유효하지 않은 인증 코드입니다',
            details: {},
          },
        });
        return;
      }

      // OAuth 콜백 처리 (Mock)
      const { user: callbackUser, tokens } = await AuthService.handleGoogleCallback(code);

      // 사용자 정보 저장 또는 업데이트
      const existingUser = await get<User>(
        'SELECT * FROM users WHERE google_user_id = ?',
        [callbackUser.google_user_id]
      );

      let user: User;
      const encryptedTokens = AuthService.encryptTokens(tokens);

      if (existingUser) {
        // 기존 사용자 업데이트
        await run(
          `UPDATE users SET 
            email = ?, 
            name = ?, 
            profile_image_url = ?,
            oauth_token_encrypted = ?,
            refresh_token_encrypted = ?,
            token_expires_at = ?,
            last_login_at = CURRENT_TIMESTAMP,
            is_active = 1
          WHERE google_user_id = ?`,
          [
            callbackUser.email,
            callbackUser.name,
            callbackUser.profile_image_url,
            encryptedTokens.encrypted_access_token,
            encryptedTokens.encrypted_refresh_token,
            encryptedTokens.expires_at,
            callbackUser.google_user_id,
          ]
        );

        const updatedUser = await get<User>(
          'SELECT * FROM users WHERE google_user_id = ?',
          [callbackUser.google_user_id]
        );
        user = updatedUser!;
      } else {
        // 신규 사용자 생성
        await run(
          `INSERT INTO users (
            google_user_id, email, name, profile_image_url,
            oauth_token_encrypted, refresh_token_encrypted, token_expires_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            callbackUser.google_user_id,
            callbackUser.email,
            callbackUser.name,
            callbackUser.profile_image_url,
            encryptedTokens.encrypted_access_token,
            encryptedTokens.encrypted_refresh_token,
            encryptedTokens.expires_at,
          ]
        );

        const newUser = await get<User>(
          'SELECT * FROM users WHERE google_user_id = ?',
          [callbackUser.google_user_id]
        );
        user = newUser!;
      }

      // JWT 토큰 생성
      const jwtToken = AuthService.createJWTToken(user);

      // 프론트엔드로 리디렉션 (토큰 포함)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?token=${jwtToken}`);
    } catch (error) {
      logger.error('OAuth 콜백 처리 실패:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: '인증 처리 중 오류가 발생했습니다',
          details: {},
        },
      });
    }
  }

  /**
   * 로그아웃
   */
  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.user_id;
      if (userId) {
        // 실제로는 토큰을 블랙리스트에 추가하거나 세션을 무효화
        logger.info(`사용자 로그아웃: ${userId}`);
      }

      res.json({
        success: true,
        message: '로그아웃되었습니다',
      });
    } catch (error) {
      logger.error('로그아웃 실패:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: '로그아웃 처리 중 오류가 발생했습니다',
          details: {},
        },
      });
    }
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
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

      const user = await get<User>('SELECT user_id, google_user_id, email, name, profile_image_url, is_active, created_at, last_login_at FROM users WHERE user_id = ?', [userId]);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '사용자를 찾을 수 없습니다',
            details: {},
          },
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('사용자 정보 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'USER_ERROR',
          message: '사용자 정보 조회 중 오류가 발생했습니다',
          details: {},
        },
      });
    }
  }
}


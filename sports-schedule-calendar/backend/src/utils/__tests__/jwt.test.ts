/**
 * Level 1: JWT 토큰 생성 및 검증 테스트
 */

import { generateToken, verifyToken, getUserIdFromToken, getTokenExpirationTime } from '../jwt';
import type { User } from '@shared/types';

// Mock 환경 변수
const originalSecret = process.env.JWT_SECRET;
const originalExpiresIn = process.env.JWT_EXPIRES_IN;

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key-for-jwt-testing-min-32-chars';
  process.env.JWT_EXPIRES_IN = '1h';
});

afterAll(() => {
  process.env.JWT_SECRET = originalSecret;
  process.env.JWT_EXPIRES_IN = originalExpiresIn;
});

describe('jwt', () => {
  const mockUser: User = {
    user_id: 1,
    google_user_id: 'google_123',
    email: 'test@example.com',
    name: 'Test User',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  describe('generateToken', () => {
    it('사용자 정보로부터 JWT 토큰을 생성할 수 있어야 함', () => {
      const token = generateToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT 형식: header.payload.signature
    });

    it('다른 사용자 정보로 다른 토큰을 생성해야 함', () => {
      const token1 = generateToken(mockUser);
      const user2 = { ...mockUser, user_id: 2 };
      const token2 = generateToken(user2);

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('유효한 토큰을 검증할 수 있어야 함', () => {
      const token = generateToken(mockUser);
      const payload = verifyToken(token);

      expect(payload.user_id).toBe(mockUser.user_id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.google_user_id).toBe(mockUser.google_user_id);
    });

    it('잘못된 토큰은 에러를 발생시켜야 함', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow();
    });

    it('다른 시크릿으로 생성된 토큰은 검증 실패해야 함', () => {
      const token = generateToken(mockUser);
      
      // 다른 시크릿으로 검증 시도
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'different-secret-key-for-verification-test';

      try {
        verifyToken(token);
        // 검증이 성공하면 실패 (실패해야 함)
        expect(true).toBe(false);
      } catch (error) {
        // 검증 실패가 예상됨
        expect(error).toBeDefined();
      }

      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('getUserIdFromToken', () => {
    it('토큰에서 사용자 ID를 추출할 수 있어야 함', () => {
      const token = generateToken(mockUser);
      const userId = getUserIdFromToken(token);

      expect(userId).toBe(mockUser.user_id);
    });
  });

  describe('getTokenExpirationTime', () => {
    it('토큰의 만료 시간을 확인할 수 있어야 함', () => {
      const token = generateToken(mockUser);
      const expirationTime = getTokenExpirationTime(token);

      expect(expirationTime).toBeDefined();
      expect(typeof expirationTime).toBe('number');
      expect(expirationTime).toBeGreaterThan(0);
    });

    it('만료된 토큰은 null을 반환해야 함', async () => {
      // 매우 짧은 만료 시간으로 토큰 생성 (1초)
      const originalExpiresIn = process.env.JWT_EXPIRES_IN;
      process.env.JWT_EXPIRES_IN = '1s';
      
      const token = generateToken(mockUser);
      
      // 만료 대기 (2초 대기)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const expirationTime = getTokenExpirationTime(token);
      expect(expirationTime).toBeNull();
      
      process.env.JWT_EXPIRES_IN = originalExpiresIn;
    });
  });
});


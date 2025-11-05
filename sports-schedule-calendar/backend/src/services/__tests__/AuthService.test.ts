/**
 * Level 1: 인증 서비스 테스트
 */

import {
  generateGoogleAuthUrl,
  handleGoogleCallback,
  encryptTokens,
  decryptTokens,
  createJWTToken,
  verifyJWTToken,
  isTokenExpired,
} from '../AuthServiceLevel1';
import type { User } from '@shared/types';

// Mock 환경 변수
const originalClientId = process.env.GOOGLE_CLIENT_ID;
const originalJWTSecret = process.env.JWT_SECRET;
const originalEncryptionKey = process.env.ENCRYPTION_KEY;

beforeAll(() => {
  process.env.GOOGLE_CLIENT_ID = 'test-client-id';
  process.env.JWT_SECRET = 'test-secret-key-for-jwt-testing-min-32-chars';
  process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
});

afterAll(() => {
  process.env.GOOGLE_CLIENT_ID = originalClientId;
  process.env.JWT_SECRET = originalJWTSecret;
  process.env.ENCRYPTION_KEY = originalEncryptionKey;
});

describe('AuthService', () => {
  describe('generateGoogleAuthUrl', () => {
    it('Google OAuth URL을 생성할 수 있어야 함', () => {
      const redirectUri = 'http://localhost:3001/callback';
      const url = generateGoogleAuthUrl(redirectUri);

      expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain(`redirect_uri=${encodeURIComponent(redirectUri)}`);
      expect(url).toContain('response_type=code');
      expect(url).toContain(encodeURIComponent('https://www.googleapis.com/auth/calendar'));
    });
  });

  describe('handleGoogleCallback', () => {
    it('유효한 인증 코드로 사용자 정보와 토큰을 반환해야 함', () => {
      const code = 'valid-auth-code-1234567890';
      const result = handleGoogleCallback(code);

      expect(result.user).toBeDefined();
      expect(result.user.google_user_id).toContain('google_');
      expect(result.tokens).toBeDefined();
      expect(result.tokens.access_token).toContain('mock_access_token_');
      expect(result.tokens.refresh_token).toContain('mock_refresh_token_');
    });

    it('유효하지 않은 인증 코드는 에러를 발생시켜야 함', () => {
      expect(() => {
        handleGoogleCallback('short');
      }).toThrow();
    });
  });

  describe('encryptTokens / decryptTokens', () => {
    it('토큰을 암호화하고 복호화할 수 있어야 함', () => {
      const tokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_at: new Date().toISOString(),
      };

      const encrypted = encryptTokens(tokens);
      const decrypted = decryptTokens(encrypted);

      expect(decrypted.access_token).toBe(tokens.access_token);
      expect(decrypted.refresh_token).toBe(tokens.refresh_token);
      expect(decrypted.expires_at).toBe(tokens.expires_at);
    });
  });

  describe('createJWTToken / verifyJWTToken', () => {
    const mockUser: User = {
      user_id: 1,
      google_user_id: 'google_123',
      email: 'test@example.com',
      name: 'Test User',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    it('사용자 정보로 JWT 토큰을 생성하고 검증할 수 있어야 함', () => {
      const token = createJWTToken(mockUser);
      const userId = verifyJWTToken(token);

      expect(userId).toBe(mockUser.user_id);
    });
  });

  describe('isTokenExpired', () => {
    it('만료된 토큰을 감지할 수 있어야 함', () => {
      const expiredDate = new Date(Date.now() - 1000).toISOString();
      expect(isTokenExpired(expiredDate)).toBe(true);
    });

    it('만료되지 않은 토큰을 감지할 수 있어야 함', () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString();
      expect(isTokenExpired(futureDate)).toBe(false);
    });
  });
});

